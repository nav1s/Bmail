#include <gtest/gtest.h>
#include "../src/validator/CommandValidator.h"

/**
 * @class CommandValidatorTests
 * @brief Test fixture for CommandValidator unit tests.
 * 
 * Provides a common CommandValidator instance for all test cases.
 */
class CommandValidatorTests : public ::testing::Test {
protected:
    CommandValidator validator;
};

/**
 * @brief Test case for validating correct POST command formats with valid URLs.
 */
TEST_F(CommandValidatorTests, ValidPostCommands) {
    EXPECT_TRUE(validator.validate("POST www.google.com"));
    EXPECT_TRUE(validator.validate("POST http://www.example.com"));
    EXPECT_TRUE(validator.validate("POST https://kanarit.com"));
}

/**
 * @brief Test case for validating correct GET command formats with valid URLs.
 */
TEST_F(CommandValidatorTests, ValidGetCommands) {
    EXPECT_TRUE(validator.validate("GET google.com"));
    EXPECT_TRUE(validator.validate("GET https://mail.google.com"));
    EXPECT_TRUE(validator.validate("GET http://example.com/search"));
}

/**
 * @brief Test case for validating correct DELETE command formats with valid URLs.
 */
TEST_F(CommandValidatorTests, ValidDeleteCommands) {
    EXPECT_TRUE(validator.validate("DELETE www.example.com"));
    EXPECT_TRUE(validator.validate("DELETE https://sub.domain.com"));
    EXPECT_TRUE(validator.validate("DELETE http://example.org/path"));
}

/**
 * @brief Test case for invalid command keywords.
 */
TEST_F(CommandValidatorTests, InvalidCommandKeywords) {
    EXPECT_FALSE(validator.validate("PUT www.example.com"));   // Unsupported verb
    EXPECT_FALSE(validator.validate("post www.example.com"));  // Lowercase
    EXPECT_FALSE(validator.validate("FETCH www.example.com")); // Not allowed
    EXPECT_FALSE(validator.validate("DEL www.example.com"));   // Abbreviation
}

/**
 * @brief Test case for invalid or malformed URLs.
 */
TEST_F(CommandValidatorTests, InvalidUrls) {
    EXPECT_FALSE(validator.validate("POST not_a_url"));
    EXPECT_FALSE(validator.validate("GET .com"));
    EXPECT_FALSE(validator.validate("DELETE www..com"));
    EXPECT_FALSE(validator.validate("GET http://"));             // Protocol only
    EXPECT_FALSE(validator.validate("POST https://exa#mple.com")); // Invalid character
}

/**
 * @brief Test case for commands missing a URL argument.
 */
TEST_F(CommandValidatorTests, MissingUrlArgument) {
    EXPECT_FALSE(validator.validate("GET"));
    EXPECT_FALSE(validator.validate("POST"));
    EXPECT_FALSE(validator.validate("DELETE"));
}

/**
 * @brief Test case for commands with extra arguments beyond command and URL.
 */
TEST_F(CommandValidatorTests, ExtraArguments) {
    EXPECT_FALSE(validator.validate("GET www.google.com extra"));
    EXPECT_FALSE(validator.validate("POST www.example.com extra token"));
    EXPECT_FALSE(validator.validate("DELETE www.example.com trailing"));
}

/**
 * @brief Test case for empty or meaningless input strings.
 */
TEST_F(CommandValidatorTests, EmptyOrWhitespaceInputs) {
    EXPECT_FALSE(validator.validate(""));
    EXPECT_FALSE(validator.validate(" "));
    EXPECT_FALSE(validator.validate("#"));
    EXPECT_FALSE(validator.validate("    "));
}
