#include <gtest/gtest.h>
#include "../src/StringValidator/UrlValidator.h"

class UrlValidatorTests : public ::testing::Test {
protected:
    UrlValidator validator;
};

// Test case for various valid URLs
TEST_F(UrlValidatorTests, ValidUrls) {
    // Basic HTTPS (from original)
    EXPECT_TRUE(validator.validate("https://www.google.com"));
    EXPECT_TRUE(validator.validate("https://mail.google.com"));
    EXPECT_TRUE(validator.validate("https://www.kanarit.com"));

    // Basic HTTP
    EXPECT_TRUE(validator.validate("http://example.com"));

    // With path
    EXPECT_TRUE(validator.validate("https://www.google.com/search"));

    // Subdomains
    EXPECT_TRUE(validator.validate("https://sub.domain.example.com"));

    // Different TLDs
    EXPECT_TRUE(validator.validate("https://example.org"));
    EXPECT_TRUE(validator.validate("http://example.co.uk"));
    EXPECT_TRUE(validator.validate("https://example.info"));
    EXPECT_TRUE(validator.validate("http://example.io/path"));

    // Missing protocol scheme
    EXPECT_TRUE(validator.validate("www.google.com"));
    EXPECT_TRUE(validator.validate("google.com"));
    EXPECT_TRUE(validator.validate("example.com/path"));

}

// Test case for various invalid URLs
TEST_F(UrlValidatorTests, InvalidUrls) {
    // Non-URL strings
    EXPECT_FALSE(validator.validate("1234"));
    EXPECT_FALSE(validator.validate("just a string"));
    EXPECT_FALSE(validator.validate("")); // Empty string

    // Invalid protocol scheme
    EXPECT_FALSE(validator.validate("htp://google.com"));
    EXPECT_FALSE(validator.validate("https:// google.com")); // Space after scheme
    EXPECT_FALSE(validator.validate("ftp:/example.com")); // Common mistake, needs ftp://
    EXPECT_FALSE(validator.validate("javascript:alert('hi')")); // Not an HTTP/S URL

    // Malformed URLs
    EXPECT_FALSE(validator.validate("http:/google.com")); // Single slash after scheme
    EXPECT_FALSE(validator.validate("http: //google.com")); // Space after colon
    EXPECT_FALSE(validator.validate("https://")); // Protocol only
    EXPECT_FALSE(validator.validate("http://")); // Protocol only
    EXPECT_FALSE(validator.validate("http:// example.com")); // Space before domain
    EXPECT_FALSE(validator.validate("http://exa mple.com")); // Space within domain
    EXPECT_FALSE(validator.validate("http://example.com:port")); // Invalid port format (non-numeric)
    EXPECT_FALSE(validator.validate("http://example.com:65536")); // Port number out of valid range (0-65535)
    EXPECT_FALSE(validator.validate("http://.com")); // Missing domain name part
    EXPECT_FALSE(validator.validate("https://exa#mple.com")); // Invalid character (#) in domain name
    EXPECT_FALSE(validator.validate("http://example.com/path^")); // Invalid character in path

    // Relative paths (not absolute URLs)
    EXPECT_FALSE(validator.validate("/path/to/resource")); // Absolute path, no domain
    EXPECT_FALSE(validator.validate("../relative/path")); // Relative path

    // Protocol-relative URLs 
    EXPECT_FALSE(validator.validate("//google.com"));
}

// Main function to run all tests
int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}