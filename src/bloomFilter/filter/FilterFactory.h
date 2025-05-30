#pragma once

#include "IFilter.h"
#include "../hash/IHashFunction.h"
#include <memory>
#include <string>
#include <vector>

class FilterFactory {
public:
    /**
     * @brief Creates a BloomFilter with the specified parameters
     * 
     * @param arraySize Size of the Bloom filter bit array
     * @param hashParams Parameters for the hash functions
     * @param storagePath Path where the filter will be stored/loaded
     * @return std::shared_ptr<IFilter> The created filter
     */
    static std::shared_ptr<IFilter> createBloomFilter(
        size_t arraySize,
        const std::vector<int>& hashParams,
        const std::string& storagePath
    );

private:
    /**
     * @brief Creates hash functions based on the provided parameters
     * 
     * @param params Parameters for the hash functions
     * @return std::vector<std::shared_ptr<IHashFunction>> Vector of hash functions
     */
    static std::vector<std::shared_ptr<IHashFunction>> createHashFunctions(
        const std::vector<int>& params
    );
};