#include <gtest/gtest.h>
#include "../src/filter/BloomFilter.h"
#include "../src/hash/StdHash.h"

class BloomFilterTests : public ::testing::Test {
protected:
    std::shared_ptr<BloomFilter> filter;
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
};

TEST_F(BloomFilterTests, AddSingleItem) {
    hashFunctions.push_back(std::make_shared<StdHash>(1));
    filter = std::make_shared<BloomFilter>(5, hashFunctions);
    filter->add("abc");
    EXPECT_TRUE(filter->isBlacklisted("abc"));
}

TEST_F(BloomFilterTests, AddMultipleItems) {
    hashFunctions.push_back(std::make_shared<StdHash>(2));
    filter = std::make_shared<BloomFilter>(10, hashFunctions);

    filter->add("dog");
    filter->add("cat");
    filter->add("fish");

    EXPECT_TRUE(filter->isBlacklisted("dog"));
    EXPECT_TRUE(filter->isBlacklisted("cat"));
    EXPECT_TRUE(filter->isBlacklisted("fish"));
}

TEST_F(BloomFilterTests, ItemNotAddedShouldNotBeBlacklisted) {
    hashFunctions.push_back(std::make_shared<StdHash>(3));
    filter = std::make_shared<BloomFilter>(10, hashFunctions);

    filter->add("lion");

    EXPECT_FALSE(filter->isBlacklisted("tiger"));
}

TEST_F(BloomFilterTests, FalsePositivePossibleButUnlikelyWithDifferentSeeds) {
    hashFunctions.push_back(std::make_shared<StdHash>(1));
    hashFunctions.push_back(std::make_shared<StdHash>(2));
    hashFunctions.push_back(std::make_shared<StdHash>(3));
    filter = std::make_shared<BloomFilter>(50, hashFunctions);

    filter->add("elephant");
    filter->add("giraffe");

    bool result = filter->isBlacklisted("kangaroo");
    EXPECT_FALSE(result);
}

TEST_F(BloomFilterTests, SameItemMultipleAdds) {
    hashFunctions.push_back(std::make_shared<StdHash>(4));
    filter = std::make_shared<BloomFilter>(10, hashFunctions);

    filter->add("parrot");
    filter->add("parrot");
    filter->add("parrot");

    EXPECT_TRUE(filter->isBlacklisted("parrot"));
}

TEST_F(BloomFilterTests, EmptyFilterCheck) {
    hashFunctions.push_back(std::make_shared<StdHash>(5));
    filter = std::make_shared<BloomFilter>(5, hashFunctions);

    EXPECT_FALSE(filter->isBlacklisted("anyitem"));
}

TEST_F(BloomFilterTests, OneArrayCell) {
    hashFunctions.push_back(std::make_shared<StdHash>(1));
    filter = std::make_shared<BloomFilter>(1, hashFunctions);

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
