#pragma once

#include "IFileManager.h"
#include <string>

/**
 * @class BloomFilterFileManager
 * @brief Concrete implementation of IFileManager for managing BloomFilter persistence.
 *
 * Handles saving a BloomFilter's bit array, hash function names, and real blacklist to a file,
 * and loading them back into a provided BloomFilter instance.
 */
class BloomFilterFileManager : public IFileManager {
public:
    /**
     * @brief Constructs a BloomFilterFileManager with a file path.
     * @param path Path to the file used for saving/loading Bloom filter data.
     */
    explicit BloomFilterFileManager(const std::string& directory);

    /**
     * @brief Copy constructor.
     */
    BloomFilterFileManager(const BloomFilterFileManager& other);

    /**
     * @brief Move constructor.
     */
    BloomFilterFileManager(BloomFilterFileManager&& other) noexcept;

    /**
     * @brief Copy assignment operator.
     */
    BloomFilterFileManager& operator=(const BloomFilterFileManager& other);

    /**
     * @brief Move assignment operator.
     */
    BloomFilterFileManager& operator=(BloomFilterFileManager&& other) noexcept;

    /**
     * @brief Destructor.
     */
    ~BloomFilterFileManager() override;

    /**
     * @brief Saves the given BloomFilter object to the configured file.
     * @param object Pointer to a BloomFilter.
     */
    void save(void* object) const override;

    /**
     * @brief Loads the BloomFilter data from the file into the given object.
     * @param object Pointer to a BloomFilter.
     */
    void load(void* object) const override;

private:
    std::string filePath;
};
