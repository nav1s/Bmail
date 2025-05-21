#include <gtest/gtest.h>
#include "../src/bloomFilter/hash/StdHash.h"

/**
 * @class StdHashTest
 * @brief Test fixture for StdHash tests.
 */
class StdHashTest : public ::testing::Test {};

/**
 * @brief Tests that the constructor properly validates the repetition count.
 * 
 * Ensures that the constructor throws std::invalid_argument for non-positive
 * repetition counts and does not throw for positive counts.
 */
TEST_F(StdHashTest, ConstructorThrowsOnInvalidReps) {
    // Test cases for invalid repetition counts (should throw)
    EXPECT_THROW(StdHash(0), std::invalid_argument);
    EXPECT_THROW(StdHash(-1), std::invalid_argument);
    // Test cases for valid repetition counts (should not throw)
    EXPECT_NO_THROW(StdHash(1));
    EXPECT_NO_THROW(StdHash(5));
}

/**
 * @brief Tests that hashing the same input multiple times produces the same result.
 */
TEST_F(StdHashTest, HashProducesConsistentResults) {
    StdHash hasher(1);
    std::string input = "test";
    size_t hash1 = hasher.hash(input);
    size_t hash2 = hasher.hash(input);
    EXPECT_EQ(hash1, hash2);
}

/**
 * @brief Tests that different inputs produce different hash values.
 */
TEST_F(StdHashTest, DifferentInputsProduceDifferentHashes) {
    StdHash hasher(1);
    std::string input1 = "test1";
    std::string input2 = "test2";
    EXPECT_NE(hasher.hash(input1), hasher.hash(input2));
}

/**
 * @brief Tests that increasing the number of repetitions produces different hash values.
 */
TEST_F(StdHashTest, MultipleRepsProduceDifferentResults) {
    std::string input = "test";
    StdHash hasher1(1);
    StdHash hasher2(2);
    StdHash hasher3(3);
    
    size_t hash1 = hasher1.hash(input);
    size_t hash2 = hasher2.hash(input);
    size_t hash3 = hasher3.hash(input);
    
    // Hashes with different repetition counts should generally be different
    EXPECT_NE(hash1, hash2);
    EXPECT_NE(hash2, hash3);
    EXPECT_NE(hash1, hash3);
}

/**
 * @brief Tests that hashing an empty string works without throwing exceptions.
 */
TEST_F(StdHashTest, EmptyStringHash) {
    StdHash hasher(1);
    std::string empty = "";
    EXPECT_NO_THROW(hasher.hash(empty)); // Ensure no crash or exception
}

/**
 * @brief Tests that hashing a long string works without throwing exceptions.
 */
TEST_F(StdHashTest, LongStringHash) {
    StdHash hasher(1);
    std::string longString(1000, 'a'); // Create a reasonably long string
    EXPECT_NO_THROW(hasher.hash(longString)); // Ensure no crash or exception
} 