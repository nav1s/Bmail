#include "BloomFilter.h"
#include "../hash/IHashFunction.h"
#include <memory>
#include <vector>
#include <string>
#include "../FileManager/BloomFilterFileManager.h"
#include <iostream>

using namespace std;

BloomFilter::BloomFilter(size_t size, vector<shared_ptr<IHashFunction>> hashFuncs)
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

void BloomFilter::add(const string& item) {
    realBlacklist.insert(item);
    // resizing array: disabled atm
    // if (checkArraySize()) {
    //     resizeArray();
    // }
    for (const auto& hashFunc : hashFunctions) {
        size_t i = getIndex(*hashFunc, item);
        bitArray[i] = true;
    }
}


bool BloomFilter::isBlacklisted(const string& item) const {
    if (possiblyContains(item)) {
        return isActuallyBlacklisted(item);
    }
    return false;
}

void BloomFilter::saveToFile(const string& path) const {
    BloomFilterFileManager manager(path);
    manager.save((void*)this);
}

void BloomFilter::loadFromFile(const string& path) {
    BloomFilterFileManager manager(path);
    manager.load((void*)this);
}

size_t BloomFilter::getIndex(const IHashFunction& hashFunc, const string& item) const {
    return hashFunc.hash(item) % arraySize; 
}

bool BloomFilter::possiblyContains(const string& item) const {
    for (const auto& hashFunc : hashFunctions) {
        if (!bitArray[getIndex(*hashFunc, item)]) {
            return false;
        }
    }
    return true;
}


bool BloomFilter::isActuallyBlacklisted(const string& item) const {
    return realBlacklist.find(item) != realBlacklist.end();
}

const vector<bool>& BloomFilter::getBitArray() const {
    return bitArray;
}

unordered_set<string> BloomFilter::getBlacklist() const {
    return realBlacklist;
}

size_t BloomFilter::getArraySize() const {
    return arraySize;
}

vector<shared_ptr<IHashFunction>> BloomFilter::getHashFunctions() const {
    return hashFunctions;
}

void BloomFilter::reset(size_t size, const vector<bool>& bits, const vector<shared_ptr<IHashFunction>>& hashes, const unordered_set<string>& blacklist) {
arraySize = size;
bitArray = bits;
hashFunctions = hashes;
realBlacklist = blacklist;
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
