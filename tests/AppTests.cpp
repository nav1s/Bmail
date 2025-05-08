#include "../src/app/App.h"
#include <filesystem>
#include <gtest/gtest.h>
#include <memory>
#include <string>
#include <vector>

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
            std::filesystem::remove_all("../../data");
        }
    }

    void runAppBriefly(std::shared_ptr<MockInputReader> mockReader, std::shared_ptr<MockOutputWriter> mockWriter) {
        try {
            std::vector<int> args = {8, 1, 2}; // Example arguments for initialization
            app->run(*mockReader, *mockWriter, args);
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
        "a",                     // Invalid command
        "GET www.example.com0",  // Query non-existent URL
        "x",                     // Invalid command
        "POST www.example.com0", // Add URL
        "GET www.example.com0",  // Query added URL
        "GET www.example.com1",  // Query non-existent URL
        "GET www.example.com11"  // Query URL that will cause false positive
    };

    mockReader = std::make_shared<MockInputReader>(exampleRun1);
    mockWriter = std::make_shared<MockOutputWriter>();

    // Run the app with the user sequence
    ASSERT_NO_THROW(runAppBriefly(mockReader, mockWriter));

    // Check that we got at exactly 7 outputs
    ASSERT_EQ(mockWriter->outputLines.size(), 7);

    // first query should be "400 Bad Request" (invalid command)
    EXPECT_EQ(mockWriter->outputLines[0], "400 Bad Request");

    // second query should be "200 OK" (false because URL is not in filter)
    EXPECT_EQ(mockWriter->outputLines[1], "200 OK\n\nfalse");

    // third query should be "400 Bad Request" (invalid command)
    EXPECT_EQ(mockWriter->outputLines[2], "400 Bad Request");

    // fourth query should be "201 Created" (added URL)
    EXPECT_EQ(mockWriter->outputLines[3], "201 Created");

    // fifth query should be "200 OK" (true true because URL is in filter)
    EXPECT_EQ(mockWriter->outputLines[4], "200 OK\n\ntrue true");

    // sixth query should be "200 OK" (false because URL is not in filter)
    EXPECT_EQ(mockWriter->outputLines[5], "200 OK\n\nfalse");

    // seventh query should be "200 OK" (true false because it's a false positive)
    EXPECT_EQ(mockWriter->outputLines[6], "200 OK\n\ntrue false");
}

/**
 * @brief Tests the App with the second example from the task
 */
TEST_F(AppTests, exampleRun2) {
    // Create a sequence that mimics the user's example
    std::vector<std::string> exampleRun2 = {"POST www.example.com0", "GET www.example.com0", "GET www.example.com1"};

    mockReader = std::make_shared<MockInputReader>(exampleRun2);
    mockWriter = std::make_shared<MockOutputWriter>();

    // Run the app with the user sequence
    ASSERT_NO_THROW(runAppBriefly(mockReader, mockWriter));

    // Check that we got at exactly 3 outputs
    ASSERT_EQ(mockWriter->outputLines.size(), 3);

    // first query should be "201 Created" (added URL)
    EXPECT_EQ(mockWriter->outputLines[0], "201 Created");

    // second query should be "200 OK" (true true because URL is in filter)
    EXPECT_EQ(mockWriter->outputLines[1], "200 OK\n\ntrue true");

    // third query should be "200 OK" (false because URL is not in filter)
    EXPECT_EQ(mockWriter->outputLines[2], "200 OK\n\nfalse");
}

/**
 * @brief Tests the App with the third example from the task
 */
TEST_F(AppTests, exampleRun3) {
    return;
    // Create a sequence that mimics the user's example
    std::vector<std::string> exampleRun3 = {"8 2", "1 www.example.com0", "2 www.example.com0", "2 www.example.com4"};

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

/**
 * @brief Tests the App with the invalid initialization
 */
TEST_F(AppTests, invalidInit) {
    return;
    std::vector<std::string> exampleRun3 = {"10 a",
                                            "10 2 b",
                                            "100",
                                            "8 2",
                                            "-5 3",
                                            "-2 4",
                                            "1 www.example.com0",
                                            "2 www.example.com0",
                                            "2 www.example.com4"};

    mockReader = std::make_shared<MockInputReader>(exampleRun3);
    mockWriter = std::make_shared<MockOutputWriter>();

    ASSERT_NO_THROW(runAppBriefly(mockReader, mockWriter));

    // Check that we got at exactly 2 outputs
    ASSERT_EQ(mockWriter->outputLines.size(), 2);

    // First query should be "true true" (URL in filter)
    EXPECT_EQ(mockWriter->outputLines[0], "true true");

    // Second query should be "true false" (URL not in filter)
    EXPECT_EQ(mockWriter->outputLines[1], "true false");
}

/**
 * @brief Tests the App with invalid command
 */
TEST_F(AppTests, InvalidCommand) {
    return;
    std::vector<std::string> invalidCommand = {"8 2",
                                               "3 www.hemi.com", // invalid command
                                               "www.hemi.com",   // invalid command
                                               "1 www.example.com0",
                                               "2 www.example.com0",
                                               "2 www.example.com4"};

    mockReader = std::make_shared<MockInputReader>(invalidCommand);
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
