#include <gtest/gtest.h>
#include "../src/hash/HashFactory.h"
#include "../src/hash/StdHash.h"
#include <memory>
#include <stdexcept>

/**
 * @class HashFactoryTest
 * @brief Test fixture for HashFactory tests.
 */
class HashFactoryTest : public ::testing::Test {};

/**
 * @brief Tests that the factory creates a StdHash when given a valid std signature.
 */
TEST_F(HashFactoryTest, CreatesStdHashFromValidSignature) {
    std::string signature = "std:3";
    auto hashFunc = HashFactory::fromSignature(signature);
    
    // Verify the hash function was created
    ASSERT_NE(hashFunc, nullptr);
    
    // Verify it's the right type by checking its signature
    EXPECT_EQ(hashFunc->getSignature(), signature);
    
    // Verify it works by hashing something
    std::string testInput = "test";
    EXPECT_NO_THROW(hashFunc->hash(testInput));
}

/**
 * @brief Tests that the factory properly handles invalid signature formats.
 */
TEST_F(HashFactoryTest, ThrowsOnInvalidSignatureFormat) {
    // No separator
    EXPECT_THROW(HashFactory::fromSignature("std3"), std::invalid_argument);
    
    // Empty string
    EXPECT_THROW(HashFactory::fromSignature(""), std::invalid_argument);
    
    // Just the separator
    EXPECT_THROW(HashFactory::fromSignature(":"), std::invalid_argument);
    
    // No type
    EXPECT_THROW(HashFactory::fromSignature(":3"), std::invalid_argument);
    
    // No parameter
    EXPECT_THROW(HashFactory::fromSignature("std:"), std::invalid_argument);
}

/**
 * @brief Tests that the factory throws when given an unknown hash type.
 */
TEST_F(HashFactoryTest, ThrowsOnUnknownHashType) {
    EXPECT_THROW(HashFactory::fromSignature("unknown:1"), std::runtime_error);
}

/**
 * @brief Tests that the factory creates hash functions with different repetition counts.
 */
TEST_F(HashFactoryTest, CreatesHashFunctionsWithDifferentParams) {
    auto hash1 = HashFactory::fromSignature("std:1");
    auto hash2 = HashFactory::fromSignature("std:2");
    
    ASSERT_NE(hash1, nullptr);
    ASSERT_NE(hash2, nullptr);
    
    EXPECT_EQ(hash1->getSignature(), "std:1");
    EXPECT_EQ(hash2->getSignature(), "std:2");
    
    // Different repetition counts should produce different hashes
    std::string testInput = "test";
    EXPECT_NE(hash1->hash(testInput), hash2->hash(testInput));
}

/**
 * @brief Tests that hash functions with the same parameters have the same behavior.
 */
TEST_F(HashFactoryTest, CreatesFunctionallyIdenticalHashFunctions) {
    auto hash1 = HashFactory::fromSignature("std:3");
    auto hash2 = HashFactory::fromSignature("std:3");
    
    ASSERT_NE(hash1, nullptr);
    ASSERT_NE(hash2, nullptr);
    
    // Different instances, but same behavior
    std::string testInput = "test";
    EXPECT_EQ(hash1->hash(testInput), hash2->hash(testInput));
} 