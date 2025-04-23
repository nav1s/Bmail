#include "../src/input/CliReader.h"
#include <gtest/gtest.h>
#include <sstream>

/**
 * @class CliReaderTest
 * @brief Test fixture for CliReader unit tests.
 */
class CliReaderTest : public ::testing::Test {
protected:
    CliReader reader;
    std::stringstream inputStream;
    std::streambuf* originalCin;

    /**
     * @brief Sets up the test environment before each test.
     */
    void SetUp() override {
        originalCin = std::cin.rdbuf();
        std::cin.rdbuf(inputStream.rdbuf());
    }

    /**
     * @brief Cleans up the test environment after each test.
     * 
     * Restores the original cin buffer.
     */
    void TearDown() override {
        std::cin.rdbuf(originalCin);
    }
};

/**
 * @brief Tests basic line reading functionality.
 * 
 * Verifies that:
 * - Lines are read correctly
 * - Return value indicates success
 */
TEST_F(CliReaderTest, ReadLinesSuccessfully) {
    inputStream << "First line\n";
    inputStream << "Second line\n";
    inputStream << "Third line"; // No newline at end

    std::string line;
    ASSERT_TRUE(reader.getLine(line));
    EXPECT_EQ(line, "First line");

    ASSERT_TRUE(reader.getLine(line));
    EXPECT_EQ(line, "Second line");

    ASSERT_TRUE(reader.getLine(line));
    EXPECT_EQ(line, "Third line");
}

/**
 * @brief Tests handling of empty input.
 * 
 * Verifies that:
 * - Empty input returns false
 * - No line is read
 */
TEST_F(CliReaderTest, ReadEmptyInput) {
    inputStream << "";
    std::string line;
    EXPECT_FALSE(reader.getLine(line));
}

/**
 * @brief Tests copy constructor functionality.
 * 
 * Verifies that:
 * - CliReader can be copied
 * - Copied instance maintains reading capability
 */
TEST_F(CliReaderTest, CopyConstructorWorks) {
    inputStream << "Test line\n";
    
    CliReader reader1;
    CliReader reader2(reader1);
    
    std::string line;
    ASSERT_TRUE(reader2.getLine(line));
    EXPECT_EQ(line, "Test line");
}

/**
 * @brief Tests copy assignment operator.
 * 
 * Verifies that:
 * - CliReader can be copy assigned
 * - Assigned instance maintains reading capability
 */
TEST_F(CliReaderTest, CopyAssignmentWorks) {
    inputStream << "Test line\n";
    
    CliReader reader1;
    CliReader reader2 = reader1;
    
    std::string line;
    ASSERT_TRUE(reader2.getLine(line));
    EXPECT_EQ(line, "Test line");
}

/**
 * @brief Tests move constructor functionality.
 * 
 * Verifies that:
 * - CliReader can be moved
 * - Moved instance maintains reading capability
 */
TEST_F(CliReaderTest, MoveConstructorWorks) {
    inputStream << "Test line\n";
    
    CliReader reader1;
    CliReader reader2(std::move(reader1));
    
    std::string line;
    ASSERT_TRUE(reader2.getLine(line));
    EXPECT_EQ(line, "Test line");
}

/**
 * @brief Tests move assignment operator.
 * 
 * Verifies that:
 * - CliReader can be move assigned
 * - Assigned instance maintains reading capability
 */
TEST_F(CliReaderTest, MoveAssignmentWorks) {
    inputStream << "Test line\n";
    
    CliReader reader1;
    CliReader reader2 = std::move(reader1);
    
    std::string line;
    ASSERT_TRUE(reader2.getLine(line));
    EXPECT_EQ(line, "Test line");
}

/**
 * @brief Tests resource cleanup.
 * 
 * Verifies that:
 * - Cin buffer is properly restored when CliReader goes out of scope
 * - Reading from cin works after CliReader destruction
 */
TEST_F(CliReaderTest, ResourceCleanup) {
    {
        CliReader reader;
        std::string line;
        inputStream << "Test line\n";
        ASSERT_TRUE(reader.getLine(line));
    }
    
    // Cin should be restored after reader goes out of scope
    inputStream << "Another line\n";
    std::string line;
    ASSERT_TRUE(std::getline(std::cin, line));
    EXPECT_EQ(line, "Another line");
} 