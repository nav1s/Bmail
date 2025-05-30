#include <gtest/gtest.h>
#include "../src/bloomFilter/filter/BloomFilter.h"
#include "../src/bloomFilter/hash/StdHash.h"
#include <filesystem>

namespace fs = std::filesystem;

/**
 * @brief Test fixture for BloomFilter tests
 * 
 * Sets up a test environment with a shared BloomFilter pointer and a vector of hash functions.
 * Manages a temporary directory for file-based tests.
 */
class BloomFilterTests : public ::testing::Test {
protected:
    std::shared_ptr<BloomFilter> filter;
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    const std::string testDir = "./test_data";
    const std::string bloomFilterFile = testDir + "/bloom_test.txt";

    void SetUp() override {
        // Create test directory if it doesn't exist
        if (!fs::exists(testDir)) {
            fs::create_directories(testDir);
        }
    }

    void TearDown() override {
        // Clean up test files after tests
        if (fs::exists(bloomFilterFile)) {
            try {
                fs::remove(bloomFilterFile);
            } catch (const std::exception& e) {
                // If it's a directory instead of a file, remove it recursively
                if (fs::is_directory(bloomFilterFile)) {
                    fs::remove_all(bloomFilterFile);
                }
            }
        }
        
        // Try to remove the test directory itself if it's empty
        try {
            if (fs::exists(testDir) && fs::is_empty(testDir)) {
                fs::remove(testDir);
            }
        } catch (const std::exception&) {
            // Ignore errors when trying to remove the test directory
        }
    }
};

/**
 * @brief Tests adding a single item to the filter
 * 
 * Verifies that an item added to the filter is correctly identified as blacklisted.
 */
TEST_F(BloomFilterTests, AddSingleItem) {
    hashFunctions.push_back(std::make_shared<StdHash>(1));
    filter = std::make_shared<BloomFilter>(5, hashFunctions, bloomFilterFile);
    filter->add("abc");
    EXPECT_TRUE(filter->isBlacklisted("abc"));
}

/**
 * @brief Tests adding multiple items to the filter
 * 
 * Verifies that multiple items added to the filter are all correctly identified as blacklisted.
 */
TEST_F(BloomFilterTests, AddMultipleItems) {
    hashFunctions.push_back(std::make_shared<StdHash>(2));
    filter = std::make_shared<BloomFilter>(10, hashFunctions, bloomFilterFile);

    filter->add("dog");
    filter->add("cat");
    filter->add("fish");

    EXPECT_TRUE(filter->isBlacklisted("dog"));
    EXPECT_TRUE(filter->isBlacklisted("cat"));
    EXPECT_TRUE(filter->isBlacklisted("fish"));
}

/**
 * @brief Tests item not added to the filter
 * 
 * Verifies that an item not added to the filter is correctly identified as not blacklisted.
 */
TEST_F(BloomFilterTests, ItemNotAddedToFilterShouldNotBeBlacklisted) {
    hashFunctions.push_back(std::make_shared<StdHash>(3));
    filter = std::make_shared<BloomFilter>(10, hashFunctions, bloomFilterFile);

    filter->add("lion");

    EXPECT_FALSE(filter->isBlacklisted("tiger"));
}

/**
 * @brief Tests false positive behavior with multiple hash functions
 * 
 * Verifies that using multiple hash functions with different seeds reduces the chance
 * of false positives, particularly with a larger bit array.
 */
TEST_F(BloomFilterTests, FalsePositivePossibleButUnlikelyWithDifferentSeeds) {
    hashFunctions.push_back(std::make_shared<StdHash>(1));
    hashFunctions.push_back(std::make_shared<StdHash>(2));
    hashFunctions.push_back(std::make_shared<StdHash>(3));
    filter = std::make_shared<BloomFilter>(50, hashFunctions, bloomFilterFile);

    filter->add("elephant");
    filter->add("giraffe");

    bool result = filter->isBlacklisted("kangaroo");
    EXPECT_FALSE(result);
}

/**
 * @brief Tests adding the same item multiple times
 * 
 * Verifies that adding the same item multiple times doesn't affect the filter's behavior
 * and the item is still correctly identified as blacklisted.
 */
TEST_F(BloomFilterTests, SameItemMultipleAdds) {
    hashFunctions.push_back(std::make_shared<StdHash>(4));
    filter = std::make_shared<BloomFilter>(10, hashFunctions, bloomFilterFile);

    filter->add("parrot");
    filter->add("parrot");
    filter->add("parrot");

    EXPECT_TRUE(filter->isBlacklisted("parrot"));
}

/**
 * @brief Tests an empty filter
 * 
 * Verifies that a newly created filter with no items added correctly identifies
 * any item as not blacklisted.
 */
TEST_F(BloomFilterTests, EmptyFilterCheck) {
    hashFunctions.push_back(std::make_shared<StdHash>(5));
    filter = std::make_shared<BloomFilter>(5, hashFunctions, bloomFilterFile);

    EXPECT_FALSE(filter->isBlacklisted("anyitem"));
}

/**
 * @brief Tests filter with a single array cell
 * 
 * Verifies that a filter with a single bit in its array still correctly maintains
 * its blacklist, even though all hash functions will map to the same index.
 */
TEST_F(BloomFilterTests, OneArrayCell) {
    hashFunctions.push_back(std::make_shared<StdHash>(1));
    filter = std::make_shared<BloomFilter>(1, hashFunctions, bloomFilterFile);

    filter->add("parrot");
    filter->add("tilde");
    filter->add("apple");
    filter->add("black");
    EXPECT_TRUE(filter->isBlacklisted("parrot"));
    EXPECT_TRUE(filter->isBlacklisted("tilde"));
    EXPECT_TRUE(filter->isBlacklisted("apple"));
    EXPECT_TRUE(filter->isBlacklisted("black"));

    EXPECT_FALSE(filter->isBlacklisted("true"));
    EXPECT_FALSE(filter->isBlacklisted("fly"));
}

/**
 * @brief Tests the copy constructor
 * 
 * Verifies that a filter created using the copy constructor correctly maintains
 * all the internal state and behavior of the original filter.
 */
TEST_F(BloomFilterTests, CopyConstructor) {
    hashFunctions.push_back(std::make_shared<StdHash>(6));
    filter = std::make_shared<BloomFilter>(10, hashFunctions,bloomFilterFile);
    
    filter->add("test1");
    filter->add("test2");
    
    BloomFilter copiedFilter(*filter);
    
    EXPECT_TRUE(copiedFilter.isBlacklisted("test1"));
    EXPECT_TRUE(copiedFilter.isBlacklisted("test2"));
    EXPECT_FALSE(copiedFilter.isBlacklisted("test3"));
    
    // Verify internal structures
    EXPECT_EQ(filter->getArraySize(), copiedFilter.getArraySize());
    EXPECT_EQ(filter->getBlacklist().size(), copiedFilter.getBlacklist().size());
    EXPECT_EQ(filter->getHashFunctions().size(), copiedFilter.getHashFunctions().size());
    
    // Verify bit array is copied correctly
    const auto& originalBits = filter->getBitArray();
    const auto& copiedBits = copiedFilter.getBitArray();
    EXPECT_EQ(originalBits.size(), copiedBits.size());
    for (size_t i = 0; i < originalBits.size(); i++) {
        EXPECT_EQ(originalBits[i], copiedBits[i]);
    }
}

/**
 * @brief Tests the move constructor
 * 
 * Verifies that a filter created using the move constructor correctly takes ownership
 * of all the internal state and behavior of the original filter.
 */
TEST_F(BloomFilterTests, MoveConstructor) {
    hashFunctions.push_back(std::make_shared<StdHash>(7));
    filter = std::make_shared<BloomFilter>(10, hashFunctions, bloomFilterFile);
    
    filter->add("movetest1");
    filter->add("movetest2");
    
    auto originalSize = filter->getArraySize();
    auto originalBlacklistSize = filter->getBlacklist().size();
    auto originalHashCount = filter->getHashFunctions().size();
    
    BloomFilter movedFilter(std::move(*filter));
    
    EXPECT_TRUE(movedFilter.isBlacklisted("movetest1"));
    EXPECT_TRUE(movedFilter.isBlacklisted("movetest2"));
    EXPECT_FALSE(movedFilter.isBlacklisted("movetest3"));
    
    // Verify internal structures
    EXPECT_EQ(originalSize, movedFilter.getArraySize());
    EXPECT_EQ(originalBlacklistSize, movedFilter.getBlacklist().size());
    EXPECT_EQ(originalHashCount, movedFilter.getHashFunctions().size());
}

/**
 * @brief Tests using multiple hash functions
 * 
 * Verifies that a filter with multiple hash functions correctly handles item addition
 * and lookup, and sets multiple bits in the bit array for better distribution.
 */
TEST_F(BloomFilterTests, MultipleHashFunctions) {
    // Use multiple hash functions with different seeds
    for (int i = 1; i <= 5; i++) {
        hashFunctions.push_back(std::make_shared<StdHash>(i));
    }
    
    filter = std::make_shared<BloomFilter>(100, hashFunctions, bloomFilterFile);
    
    std::vector<std::string> testItems = {
        "apple", "banana", "cherry", "date", "elderberry"
    };
    
    // Add items and verify they're blacklisted
    for (const auto& item : testItems) {
        filter->add(item);
        EXPECT_TRUE(filter->isBlacklisted(item));
    }
    
    // Check non-added items
    EXPECT_FALSE(filter->isBlacklisted("fig"));
    EXPECT_FALSE(filter->isBlacklisted("grape"));
    
    // Verify bit distribution - more hash functions should set more bits
    size_t setBitCount = 0;
    const auto& bitArray = filter->getBitArray();
    for (bool bit : bitArray) {
        if (bit) setBitCount++;
    }
    
    // With 5 hash functions and 5 items, we expect multiple bits to be set
    // The exact count will vary, but should be greater than just 5
    EXPECT_GT(setBitCount, 5);
}

/**
 * @brief Tests saving and loading filter to/from a file
 * 
 * Verifies that a filter can be correctly saved to a file and loaded back,
 * preserving all its internal state and behavior.
 */
TEST_F(BloomFilterTests, SaveAndLoadFile) {
    hashFunctions.push_back(std::make_shared<StdHash>(10));
    hashFunctions.push_back(std::make_shared<StdHash>(20));
    filter = std::make_shared<BloomFilter>(50, hashFunctions, bloomFilterFile);
    
    filter->add("url1.com");
    filter->add("url2.com");
    filter->add("url3.com");
    
    // Save filter to file
    filter->saveToFile();
    
    // Create a new filter with different initial state
    std::vector<std::shared_ptr<IHashFunction>> newHashFuncs;
    newHashFuncs.push_back(std::make_shared<StdHash>(30));
    auto newFilter = std::make_shared<BloomFilter>(20, newHashFuncs, bloomFilterFile);
    
    // Load from the saved file
    newFilter->loadFromFile();
    
    // Verify loaded filter has same properties
    EXPECT_EQ(filter->getArraySize(), newFilter->getArraySize());
    EXPECT_EQ(filter->getHashFunctions().size(), newFilter->getHashFunctions().size());
    EXPECT_EQ(filter->getBlacklist().size(), newFilter->getBlacklist().size());
    
    // Verify blacklisted items are recognized
    EXPECT_TRUE(newFilter->isBlacklisted("url1.com"));
    EXPECT_TRUE(newFilter->isBlacklisted("url2.com"));
    EXPECT_TRUE(newFilter->isBlacklisted("url3.com"));
    EXPECT_FALSE(newFilter->isBlacklisted("url4.com"));
}

/**
 * @brief Tests handling a large number of items
 * 
 * Verifies that the filter can correctly handle and identify a large number of items,
 * ensuring scalability and performance with many entries.
 */
TEST_F(BloomFilterTests, LargeNumberOfItems) {
    hashFunctions.push_back(std::make_shared<StdHash>(42));
    hashFunctions.push_back(std::make_shared<StdHash>(43));
    filter = std::make_shared<BloomFilter>(1000, hashFunctions, bloomFilterFile);
    
    // Add 100 items
    const int numItems = 100;
    for (int i = 0; i < numItems; i++) {
        std::string item = "item_" + std::to_string(i);
        filter->add(item);
    }
    
    // Verify all items are found
    for (int i = 0; i < numItems; i++) {
        std::string item = "item_" + std::to_string(i);
        EXPECT_TRUE(filter->isBlacklisted(item));
    }
    
    // Verify non-added items aren't found
    for (int i = numItems; i < numItems + 10; i++) {
        std::string item = "item_" + std::to_string(i);
        EXPECT_FALSE(filter->isBlacklisted(item));
    }
}

/**
 * @brief Tests getter methods return expected values
 * 
 * Verifies that all getter methods of the filter return the expected values
 * for both initial state and after adding items.
 */
TEST_F(BloomFilterTests, GettersReturnExpectedValues) {
    hashFunctions.push_back(std::make_shared<StdHash>(50));
    hashFunctions.push_back(std::make_shared<StdHash>(51));
    
    const size_t testSize = 42;
    filter = std::make_shared<BloomFilter>(testSize, hashFunctions, bloomFilterFile);
    
    // Test initial values
    EXPECT_EQ(testSize, filter->getArraySize());
    EXPECT_EQ(hashFunctions.size(), filter->getHashFunctions().size());
    EXPECT_EQ(0, filter->getBlacklist().size());
    EXPECT_EQ(testSize, filter->getBitArray().size());
    
    // Add items and test again
    filter->add("test1");
    filter->add("test2");
    
    EXPECT_EQ(2, filter->getBlacklist().size());
    auto blacklist = filter->getBlacklist();
    EXPECT_TRUE(blacklist.find("test1") != blacklist.end());
    EXPECT_TRUE(blacklist.find("test2") != blacklist.end());
}

/**
 * @brief Tests bit array updates
 * 
 * Verifies that the bit array is correctly updated when items are added to the filter,
 * with at least one bit being set for each added item.
 */
TEST_F(BloomFilterTests, BitArrayCorrectlyUpdated) {
    hashFunctions.push_back(std::make_shared<StdHash>(100));
    filter = std::make_shared<BloomFilter>(10, hashFunctions, bloomFilterFile);
    
    // Initially all bits should be false
    const auto& initialBits = filter->getBitArray();
    for (bool bit : initialBits) {
        EXPECT_FALSE(bit);
    }
    
    // Add an item and check that at least one bit is set
    filter->add("test");
    
    bool anyBitSet = false;
    const auto& updatedBits = filter->getBitArray();
    for (bool bit : updatedBits) {
        if (bit) {
            anyBitSet = true;
            break;
        }
    }
    
    EXPECT_TRUE(anyBitSet);
}
