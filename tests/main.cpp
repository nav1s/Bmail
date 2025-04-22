#include <gtest/gtest.h>

/**
 * @brief Main function to initialize and run all Google Test unit tests
 * 
 * This function:
 * 1. Initializes the Google Test framework
 * 2. Parses command line arguments for test configuration
 * 3. Runs all registered test cases
 * 
 * @param argc Number of command line arguments
 * @param argv Array of command line argument strings
 * @return int Returns 0 if all tests pass, 1 if any test fails
 */
int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}