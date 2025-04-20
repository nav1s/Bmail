#include "BloomFilter.h"
#include <algorithm>
#include <fstream>
#include "hash/IHashFunction.h"
#include "hash/StdHash.h"
#include <memory>

using namespace std;

BloomFilter::BloomFilter(size_t size, std::vector<std::shared_ptr<IHashFunction>> hashFuncs)
    : arraySize(size),
      hashFunctions(hashFuncs),
      bitArray(size, false)
{}

BloomFilter::BloomFilter(const BloomFilter& other)
    : arraySize(other.arraySize),
      bitArray(other.bitArray),
      hashFunctions(other.hashFunctions),
      realBlacklist(other.realBlacklist) {}

BloomFilter::BloomFilter(BloomFilter&& other) noexcept
    : arraySize(move(other.arraySize)),
      bitArray(move(other.bitArray)),
      hashFunctions(move(other.hashFunctions)),
      realBlacklist(move(other.realBlacklist)) {}

BloomFilter::~BloomFilter() = default;

void BloomFilter::add(const std::string& item) {
    realBlacklist.insert(item);
    // Optional: Enable if resizing is allowed later
    // if (checkArraySize()) {
    //     resizeArray();
    // }
    for (const auto& hashFunc : hashFunctions) {
        size_t i = getIndex(*hashFunc, item); // dereference pointer to call hash
        bitArray[i] = true;
    }
}


bool BloomFilter::isBlacklisted(const string& item) const {
    if (possiblyContains(item)) {
        return isActuallyBlacklisted(item);
    }
    return false;
}

// needs implemintation
void BloomFilter::saveToFile(const string& path) const {
}

// needs implemintation
void BloomFilter::loadFromFile(const string& path) {
}

size_t BloomFilter::getIndex(const IHashFunction& hashFunc, const string& item) const {
    return hashFunc.hash(item) % arraySize; 
}

bool BloomFilter::possiblyContains(const std::string& item) const {
    for (const auto& hashFunc : hashFunctions) {
        if (bitArray[getIndex(*hashFunc, item)]) {
            return true;
        }
    }
    return false;
}


bool BloomFilter::isActuallyBlacklisted(const string& item) const {
    return realBlacklist.find(item) != realBlacklist.end();
}

//currently disabled
/*
void BloomFilter::resizeArray() {
    arraySize = arraySize * 2;
    bitArray.resize(arraySize);
    fill(bitArray.begin(), bitArray.end(), false);
    for (const string& item : realBlacklist) {
        for (const HashFunction& hashFunc : hashFunctions) {
            size_t i = getIndex(hashFunc, item);
            bitArray[i] = true;
        }
    }
}*/

//currently disabled
/*
bool BloomFilter::checkArraySize() {
    int count = 0;
    for (size_t i = 0; i < arraySize; ++i) {
        if (bitArray[i]) {
            count++;
        }
    }
    return count > arraySize * 0.7;
}*/
