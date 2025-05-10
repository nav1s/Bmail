#include <gtest/gtest.h>
#include <filesystem>
#include <fstream>
#include <string>
#include <memory>
#include "../src/fileManager/BloomFilterFileManager.h"
#include "../src/filter/BloomFilter.h"
#include "../src/hash/StdHash.h"

namespace fs = std::filesystem;

/**
 * @brief Test fixture for BloomFilterFileManager tests
 * 
 * Sets up a test environment with a temporary directory and BloomFilter objects
 * to test the saving and loading functionality.
 */
class BloomFilterFileManagerTests : public ::testing::Test {
protected:
    const std::string testDir = "./test_data";
    std::shared_ptr<BloomFilterFileManager> fileManager;
    std::shared_ptr<BloomFilter> filter;
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;

    void SetUp() override {
        // Create test directory if it doesn't exist
        if (!fs::exists(testDir)) {
            fs::create_directory(testDir);
        }

        // Initialize test objects
        fileManager = std::make_shared<BloomFilterFileManager>(testDir);
        
        // Create a bloom filter with some hash functions
        hashFunctions.push_back(std::make_shared<StdHash>(1));
        hashFunctions.push_back(std::make_shared<StdHash>(2));
        filter = std::make_shared<BloomFilter>(100, hashFunctions);
    }

    void TearDown() override {
        // Clean up test directory after tests
        if (fs::exists(testDir + "/BloomFilter.txt")) {
            fs::remove(testDir + "/BloomFilter.txt");
        }
    }
};

/**
 * @brief Tests saving and loading of an empty BloomFilter
 * 
 * Verifies that a BloomFilter with no data can be correctly serialized and deserialized
 * while maintaining its properties.
 */
TEST_F(BloomFilterFileManagerTests, SaveAndLoadEmptyFilter) {
    // Save the empty filter
    fileManager->save(filter.get());

    // Create a new filter to load into
    std::vector<std::shared_ptr<IHashFunction>> newHashFunctions;
    auto newFilter = std::make_shared<BloomFilter>(50, newHashFunctions);
    
    // Load data into new filter
    fileManager->load(newFilter.get());

    // Verify the data was correctly loaded
    EXPECT_EQ(filter->getArraySize(), newFilter->getArraySize());
    EXPECT_EQ(filter->getBlacklist().size(), newFilter->getBlacklist().size());
    EXPECT_EQ(filter->getHashFunctions().size(), newFilter->getHashFunctions().size());
}

/**
 * @brief Tests saving and loading of a BloomFilter with blacklisted URLs
 * 
 * Verifies that a BloomFilter with blacklisted URLs can be correctly serialized
 * and deserialized, maintaining its data and filtering capability.
 */
TEST_F(BloomFilterFileManagerTests, SaveAndLoadFilterWithData) {
    // Add some URLs to the filter
    filter->add("https://example.com");
    filter->add("https://test.org");
    filter->add("https://sample.net");
    
    // Save the filter
    fileManager->save(filter.get());

    // Create a new filter to load into
    std::vector<std::shared_ptr<IHashFunction>> newHashFunctions;
    auto newFilter = std::make_shared<BloomFilter>(50, newHashFunctions);
    
    // Load data into new filter
    fileManager->load(newFilter.get());

    // Verify the data was correctly loaded
    EXPECT_EQ(filter->getArraySize(), newFilter->getArraySize());
    EXPECT_EQ(filter->getBlacklist().size(), newFilter->getBlacklist().size());
    EXPECT_EQ(filter->getHashFunctions().size(), newFilter->getHashFunctions().size());
    
    // Check that blacklisted URLs are recognized
    EXPECT_TRUE(newFilter->isBlacklisted("https://example.com"));
    EXPECT_TRUE(newFilter->isBlacklisted("https://test.org"));
    EXPECT_TRUE(newFilter->isBlacklisted("https://sample.net"));
    EXPECT_FALSE(newFilter->isBlacklisted("https://nonexistent.com"));
}

/**
 * @brief Tests the correctness of the persisted file format
 * 
 * Verifies that the file created by BloomFilterFileManager follows
 * the expected format with correct section headers and content.
 */
TEST_F(BloomFilterFileManagerTests, FileFormatIsCorrect) {
    filter->add("https://test-url.com");
    
    fileManager->save(filter.get());
    
    std::ifstream file(testDir + "/BloomFilter.txt");
    ASSERT_TRUE(file.is_open());
    
    std::string line;
    
    // Check ArraySize line
    ASSERT_TRUE(std::getline(file, line));
    EXPECT_TRUE(line.find("ArraySize: ") == 0);
    
    // Check BitArray line
    ASSERT_TRUE(std::getline(file, line));
    EXPECT_TRUE(line.find("BitArray: ") == 0);
    
    // Check HashList line
    ASSERT_TRUE(std::getline(file, line));
    EXPECT_TRUE(line.find("HashList: ") == 0);
    
    // Check Blacklist line
    ASSERT_TRUE(std::getline(file, line));
    EXPECT_TRUE(line.find("Blacklist: ") == 0);
    EXPECT_NE(line.find("https://test-url.com"), std::string::npos);
    
    file.close();
}


/**
 * @brief Tests error handling for non-existent directories
 * 
 * Verifies that the BloomFilterFileManager correctly throws an exception
 * when initialized with a non-existent directory path.
 */
TEST_F(BloomFilterFileManagerTests, LoadFromNonExistentFile) {
    // Create a new filter with a non-existent file path
    std::string nonExistentDir = "./non_existent_dir";
    
    // Expect exception when directory doesn't exist
    EXPECT_THROW({
        BloomFilterFileManager badFileManager(nonExistentDir);
    }, std::runtime_error);
}

/**
 * @brief Tests copy and move semantics of BloomFilterFileManager
 * 
 * Verifies that copy/move constructors and assignment operators correctly
 * maintain the file path and functional behavior of the manager.
 */
TEST_F(BloomFilterFileManagerTests, CopyAndMoveConstructors) {
    // Add some data to the filter
    filter->add("https://example.com");
    fileManager->save(filter.get());
    
    // Test copy constructor
    BloomFilterFileManager copiedManager(*fileManager);
    auto newFilter1 = std::make_shared<BloomFilter>(50, std::vector<std::shared_ptr<IHashFunction>>());
    copiedManager.load(newFilter1.get());
    EXPECT_TRUE(newFilter1->isBlacklisted("https://example.com"));
    
    // Test move constructor
    BloomFilterFileManager movedManager(std::move(copiedManager));
    auto newFilter2 = std::make_shared<BloomFilter>(50, std::vector<std::shared_ptr<IHashFunction>>());
    movedManager.load(newFilter2.get());
    EXPECT_TRUE(newFilter2->isBlacklisted("https://example.com"));
    
    // Test copy assignment
    BloomFilterFileManager assignedManager("./");
    assignedManager = *fileManager;
    auto newFilter3 = std::make_shared<BloomFilter>(50, std::vector<std::shared_ptr<IHashFunction>>());
    assignedManager.load(newFilter3.get());
    EXPECT_TRUE(newFilter3->isBlacklisted("https://example.com"));
    
    // Test move assignment
    BloomFilterFileManager moveAssignedManager("./");
    moveAssignedManager = std::move(assignedManager);
    auto newFilter4 = std::make_shared<BloomFilter>(50, std::vector<std::shared_ptr<IHashFunction>>());
    moveAssignedManager.load(newFilter4.get());
    EXPECT_TRUE(newFilter4->isBlacklisted("https://example.com"));
}

/**
 * @brief Tests error handling for invalid object casting
 * 
 * Verifies that BloomFilterFileManager correctly handles invalid input
 * such as null pointers or incorrectly typed objects.
 */
TEST_F(BloomFilterFileManagerTests, InvalidObjectCast) {
    // Try to save a null pointer
    EXPECT_THROW({
        fileManager->save(nullptr);
    }, std::runtime_error);
    
    // Try to save wrong object type
    int wrongObject = 42;
    EXPECT_THROW({
        fileManager->save(&wrongObject);
    }, std::runtime_error);
    
    // Try to load into a null pointer
    EXPECT_THROW({
        fileManager->load(nullptr);
    }, std::runtime_error);
} 