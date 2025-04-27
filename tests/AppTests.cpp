#include "../src/app/App.h"
#include <filesystem>
#include <gtest/gtest.h>
#include <memory>
#include <string>
#include <vector>

// Mock classes for testing
class MockInputReader : public InputReader {
private:
  std::vector<std::string> lines;
  size_t currentLine = 0;

public:
  explicit MockInputReader(const std::vector<std::string> &inputLines) : lines(inputLines) {
  }

  bool getLine(std::string &line) override {
    if (currentLine >= lines.size()) {
      return false;
    }
    line = lines[currentLine++];
    return true;
  }

  void reset() {
    currentLine = 0;
  }
};

class MockOutputWriter : public OutputWriter {
public:
  std::vector<std::string> outputLines;

  bool putLine(const std::string &line) override {
    outputLines.push_back(line);
    return true;
  }

  void clear() {
    outputLines.clear();
  }
};

/**
 * @brief Test fixture for App class unit tests
 */
class AppTests : public ::testing::Test {
protected:
  std::unique_ptr<App> app;
  std::shared_ptr<MockInputReader> mockReader;
  std::shared_ptr<MockOutputWriter> mockWriter;

  void SetUp() override {
    app = std::make_unique<App>();

    // Create clean test environment
    if (std::filesystem::exists("../../data")) {
      std::cout << "Removing data directory" << std::endl;
      std::filesystem::remove_all("../../data");
    }
  }

  void runAppBriefly(std::shared_ptr<MockInputReader> mockReader, std::shared_ptr<MockOutputWriter> mockWriter) {
    try {
      app->run(*mockReader, *mockWriter);
    } catch (const std::exception &) {
      // Expected to throw when it runs out of input
    }
  }

  void TearDown() override {
    // Clean up any files created during tests
    if (std::filesystem::exists("../../data")) {
      std::filesystem::remove_all("../../data");
    }
  }
};

/**
 * @brief Tests the App with the first example from the task
 */
TEST_F(AppTests, exampleRun1) {
  // Create a sequence that mimics the user's example
  std::vector<std::string> exampleRun1 = {
      "a",                  // Invalid initialization
      "8 1 2",              // Valid initialization with size 8 and 2 hash functions
      "2 www.example.com0", // Query non-existent URL
      "x",                  // Invalid command
      "1 www.example.com0", // Add URL
      "2 www.example.com0", // Query added URL
      "2 www.example.com1", // Query similar but different URL
      "2 www.example.com11" // Query URL that will cause false positive
  };

  mockReader = std::make_shared<MockInputReader>(exampleRun1);
  mockWriter = std::make_shared<MockOutputWriter>();

  // Run the app with the user sequence
  ASSERT_NO_THROW(runAppBriefly(mockReader, mockWriter));

  // Check that we got at exactly 4 outputs
  ASSERT_EQ(mockWriter->outputLines.size(), 4);

  // First query should be "false" (URL not in filter)
  EXPECT_EQ(mockWriter->outputLines[0], "false");

  // Second query should be "true true" (URL in filter)
  EXPECT_EQ(mockWriter->outputLines[1], "true true");

  // Third query should be "false" (similar URL not in filter)
  EXPECT_EQ(mockWriter->outputLines[2], "false");

  // Fourth query should be "true false" (false positive)
  EXPECT_EQ(mockWriter->outputLines[3], "true false");
}

/**
 * @brief Tests the App with the second example from the task
 */
TEST_F(AppTests, exampleRun2) {
  // Create a sequence that mimics the user's example
  std::vector<std::string> exampleRun2 = {
      "8 1",
      "1 www.example.com0",
      "2 www.example.com0",
      "2 www.example.com1"
  };

  mockReader = std::make_shared<MockInputReader>(exampleRun2);
  mockWriter = std::make_shared<MockOutputWriter>();

  // Run the app with the user sequence
  ASSERT_NO_THROW(runAppBriefly(mockReader, mockWriter));

  // Check that we got at exactly 2 outputs
  ASSERT_EQ(mockWriter->outputLines.size(), 2);

  // First query should be "true true" (URL in filter)
  EXPECT_EQ(mockWriter->outputLines[0], "true true");

  // Second query should be "true false" (URL not in filter)
  EXPECT_EQ(mockWriter->outputLines[1], "true false");
}

/**
 * @brief Tests the App with the third example from the task
 */
TEST_F(AppTests, exampleRun3) {
  // Create a sequence that mimics the user's example
  std::vector<std::string> exampleRun3 = {
      "8 2",
      "1 www.example.com0",
      "2 www.example.com0",
      "2 www.example.com4"
  };

  mockReader = std::make_shared<MockInputReader>(exampleRun3);
  mockWriter = std::make_shared<MockOutputWriter>();

  // Run the app with the user sequence
  ASSERT_NO_THROW(runAppBriefly(mockReader, mockWriter));

  // Check that we got at exactly 2 outputs
  ASSERT_EQ(mockWriter->outputLines.size(), 2);

  // First query should be "true true" (URL in filter)
  EXPECT_EQ(mockWriter->outputLines[0], "true true");

  // Second query should be "true false" (URL not in filter)
  EXPECT_EQ(mockWriter->outputLines[1], "true false");
}
