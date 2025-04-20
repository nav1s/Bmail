#pragma once

#include "IFilter.h"
#include <fstream>
#include <string>
#include <vector>
#include <memory>
#include <unordered_set>
#include <functional>
#include "hash/IHashFunction.h"
#include "hash/StdHash.h"

using namespace std;

/**
 * @class BloomFilter
 * @brief A probabilistic data structure for efficiently testing set membership.
 *
 * Uses multiple hash functions to set bits in a bit array. False positives are possible,
 * but false negatives are not. A real blacklist is maintained to confirm true membership.
 */
class BloomFilter : public IFilter {
public:
    /**
     * @brief Constructs a BloomFilter with a given bit array size and hash functions.
     * @param size The number of bits in the filter.
     * @param hashFuncs A vector of hash functions to use.
     */
    BloomFilter(size_t size, std::vector<std::shared_ptr<IHashFunction>> hashFuncs);

    /**
     * @brief Copy constructor.
     * @param other The BloomFilter to copy from.
     */
    BloomFilter(const BloomFilter& other);

    /**
     * @brief Copy assignment operator (deleted).
     * @param other The BloomFilter to copy from.
     * @return Not applicable. Copy assignment is disabled for BloomFilter.
     */
    BloomFilter& operator=(const BloomFilter& other) = delete;

    /**
     * @brief Move constructor.
     * @param other The BloomFilter to move from.
     */
    BloomFilter(BloomFilter&& other) noexcept;

    /**
     * @brief Move assignment operator (deleted).
     * @param other The BloomFilter to move from.
     * @return Not applicable. Move assignment is disabled for BloomFilter.
     */
    BloomFilter& operator=(BloomFilter&& other) noexcept = delete;

    /**
     * @brief Destructor.
     */
    ~BloomFilter();

    /**
     * @brief Adds an item to the Bloom filter.
     * @param item The string to insert into the filter.
     */
    void add(const string& item) override;

    /**
     * @brief Checks if an item is blacklisted.
     * @param item The string to check.
     * @return True if the item is likely in the filter and confirmed in the blacklist.
     */
    bool isBlacklisted(const string& item) const override;

    /**
     * @brief Saves the filter's bit array and blacklist to a file.
     * @param path The path of the file to write to.
     */
    void saveToFile(const string& path) const;

    /**
     * @brief Loads the filter's bit array and blacklist from a file.
     * @param path The path of the file to read from.
     */
    void loadFromFile(const string& path);
private:
    /**
     * @brief Size of the bit array.
     * may be changed later to not a const value if want to increase size
     */
    const size_t arraySize;

    /**
     * @brief The bit array used for the filter.
     */
    vector<bool> bitArray;

    /**
     * @brief A list of hash functions used in the filter.
     */
    const std::vector<std::shared_ptr<IHashFunction>> hashFunctions;

    /**
     * @brief A real blacklist for confirming true membership.
     */
    unordered_set<string> realBlacklist;

    /**
     * @brief Computes the index for a given hash function and item.
     * @param hashFunc The hash function to use.
     * @param item The item to hash.
     * @return The index within the bit array.
     */
    size_t getIndex(const IHashFunction& hashFunc, const string& item) const;

    /**
     * @brief Checks if an item is possibly in the filter based on the bit array.
     * @param item The item to check.
     * @return True if all relevant bits are set, false otherwise.
     */
    bool possiblyContains(const string& item) const;

    /**
     * @brief Confirms whether an item is actually in the real blacklist.
     * @param item The item to verify.
     * @return True if the item is in the blacklist, false otherwise.
     */
    bool isActuallyBlacklisted(const string& item) const;

    /**
     * @brief Checks if the bit array is more than 70% full.
     * currently disabled
     * @return True if the filter should be resized.
     */
    //bool checkArraySize();

    /**
     * @brief Resizes the bit array and rehashes existing items.
     * currently disbaled
     */
    //void resizeArray();
};
