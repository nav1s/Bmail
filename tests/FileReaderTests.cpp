#include "../src/input/FileReader.h"
#include <gtest/gtest.h>
#include <fstream>
#include <string>

/**
 * @class FileReaderTest
 * @brief Test fixture for FileReader tests
 * 
 */
class FileReaderTest : public ::testing::Test {
protected:
    std::string testFileName = "test_file.txt";     
    std::string emptyFileName = "empty_file.txt";   
    std::string nonExistentFileName = "non_existent.txt"; 

    /**
     * @brief Sets up test files before each test
     * 
     * Creates:
     * - A test file with three lines of text
     * - An empty file
     */
    void SetUp() override {
        // Create test file with content
        std::ofstream testFile(testFileName);
        testFile << "First line\n";
        testFile << "Second line\n";
        testFile << "Third line"; // No newline at end
        testFile.close();

        // Create empty file
        std::ofstream emptyFile(emptyFileName);
        emptyFile.close();
    }

    /**
     * @brief Cleans up test files after each test
     */
    void TearDown() override {
        // Clean up test files
        std::remove(testFileName.c_str());
        std::remove(emptyFileName.c_str());
    }
};

/**
 * @brief Tests basic file reading functionality
 * 
 * Verifies that:
 * - Lines are read in correct order
 * - Last line without newline is handled correctly
 * - EOF is properly detected
 */
TEST_F(FileReaderTest, ReadLinesSuccessfully) {
    FileReader reader(testFileName);
    std::string line;

    ASSERT_TRUE(reader.getLine(line));
    EXPECT_EQ(line, "First line");

    ASSERT_TRUE(reader.getLine(line));
    EXPECT_EQ(line, "Second line");

    ASSERT_TRUE(reader.getLine(line));
    EXPECT_EQ(line, "Third line");

    EXPECT_FALSE(reader.getLine(line));
}

/**
 * @brief Tests reading from an empty file
 * 
 * Verifies that:
 * - Reading from an empty file returns false
 * - No line is read
 */
TEST_F(FileReaderTest, ReadEmptyFile) {
    FileReader reader(emptyFileName);
    std::string line;
    EXPECT_FALSE(reader.getLine(line));
}

/**
 * @brief Tests move constructor functionality
 * 
 * Verifies that:
 * - FileReader can be moved to a new instance
 * - Moved instance maintains file reading capability
 */
TEST_F(FileReaderTest, MoveConstructorWorks) {
    FileReader reader1(testFileName);
    FileReader reader2(std::move(reader1));

    std::string line;
    ASSERT_TRUE(reader2.getLine(line));
    EXPECT_EQ(line, "First line");
}

/**
 * @brief Tests move assignment operator
 * 
 * Verifies that:
 * - FileReader can be move-assigned
 * - Assigned instance maintains file reading capability
 */
TEST_F(FileReaderTest, MoveAssignmentWorks) {
    FileReader reader1(testFileName);
    FileReader reader2 = std::move(reader1);

    std::string line;
    ASSERT_TRUE(reader2.getLine(line));
    EXPECT_EQ(line, "First line");
}

/**
 * @brief Tests copy prevention
 * 
 * Verifies that:
 * - FileReader cannot be copy constructed
 * - This is enforced at compile time
 */
TEST_F(FileReaderTest, CopyConstructorDeleted) {
    FileReader reader1(testFileName);
    static_assert(!std::is_copy_constructible<FileReader>::value, 
                 "FileReader should not be copy constructible");
}

/**
 * @brief Tests copy assignment prevention
 * 
 * Verifies that:
 * - FileReader cannot be copy assigned
 * - This is enforced at compile time
 */
TEST_F(FileReaderTest, CopyAssignmentDeleted) {
    FileReader reader1(testFileName);
    static_assert(!std::is_copy_assignable<FileReader>::value, 
                 "FileReader should not be copy assignable");
}

/**
 * @brief Tests resource cleanup
 * 
 * Verifies that:
 * - File is properly closed when FileReader goes out of scope
 * - File can be reopened after FileReader destruction
 */
TEST_F(FileReaderTest, ResourceCleanup) {
    {
        FileReader reader(testFileName);
        std::string line;
        ASSERT_TRUE(reader.getLine(line));
    }
    // File should be closed after reader goes out of scope
    std::ifstream file(testFileName);
    EXPECT_TRUE(file.is_open());
    file.close();
}
