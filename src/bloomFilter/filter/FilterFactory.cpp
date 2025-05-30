#include "FilterFactory.h"
#include "BloomFilter.h"
#include "../hash/HashFactory.h"
#include <filesystem>

using namespace std;

vector<shared_ptr<IHashFunction>> FilterFactory::createHashFunctions(const vector<int>& params) {
    vector<shared_ptr<IHashFunction>> hashFunctions;
    
    for (int num : params) {
        string signature = "std:" + to_string(num);
        hashFunctions.push_back(HashFactory::fromSignature(signature));
    }
    
    return hashFunctions;
}

shared_ptr<IFilter> FilterFactory::createBloomFilter(
    size_t arraySize,
    const vector<int>& hashParams,
    const string& storagePath
) {
    // Create hash functions
    vector<shared_ptr<IHashFunction>> hashFunctions = createHashFunctions(hashParams);
    
    // Create filter
    auto filter = make_shared<BloomFilter>(arraySize, hashFunctions, storagePath);
    
    // Load if exists
    if (filesystem::exists(storagePath)) {
        filter->loadFromFile();
    }
    
    return filter;
}