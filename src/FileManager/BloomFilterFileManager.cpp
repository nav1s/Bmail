#include "BloomFilterFileManager.h"
#include <fstream>
#include <sstream>
#include <stdexcept>
#include <filesystem>
#include "../input/FileReader.h"
#include "../hash/HashFactory.h"

using namespace std;
using filesystem::path;
using filesystem::exists;

BloomFilterFileManager::BloomFilterFileManager(const string& directory) {
    path dirPath(directory);

    if (!filesystem::exists(dirPath)) {
        throw runtime_error("Directory does not exist: " + dirPath.string());
    }

    filePath = (dirPath / "BloomFilter.txt").string();
}

BloomFilterFileManager::BloomFilterFileManager(const BloomFilterFileManager& other)
    : filePath(other.filePath) {}

BloomFilterFileManager::BloomFilterFileManager(BloomFilterFileManager&& other) noexcept
    : filePath(std::move(other.filePath)) {}

BloomFilterFileManager& BloomFilterFileManager::operator=(const BloomFilterFileManager& other) {
    if (this != &other) {
        filePath = other.filePath;
    }
    return *this;
}

BloomFilterFileManager& BloomFilterFileManager::operator=(BloomFilterFileManager&& other) noexcept {
    if (this != &other) {
        filePath = std::move(other.filePath);
    }
    return *this;
}

BloomFilterFileManager::~BloomFilterFileManager() = default;

/**
 * @brief Save BloomFilter object to file
 */
void BloomFilterFileManager::save(void* object) const {
    //casting back to bloomFilter
    BloomFilter* filter = static_cast<BloomFilter*>(object);
    if (!filter) throw runtime_error("Invalid object passed to save");

    ofstream out(filePath);
    if (!out) throw runtime_error("Failed to open file for writing: " + filePath);

    //writing array
    out << "ArraySize: " << filter->getArraySize() << "\n";

    //writing bits
    out << "BitArray: ";
    for (bool bit : filter->getBitArray()) out << (bit ? '1' : '0');
    out << "\n";

    // writing hashes
    out << "HashList: ";
    const auto& hashFuncs = filter->getHashFunctions();
    for (size_t i = 0; i < hashFuncs.size(); ++i) {
        out << hashFuncs[i]->getSignature();
        if (i < hashFuncs.size() - 1) out << ",";
    }
    out << "\n";

    //writing urls
    out << "Blacklist: ";
    const auto& urls = filter->getBlacklist();
    size_t i = 0;
    for (const auto& url : urls) {
        out << url;
        if (++i < urls.size()) out << ",";
    }
    out << "\n";
    }

void BloomFilterFileManager::load(void* object) const {
    // Validate object type
    BloomFilter* filter = static_cast<BloomFilter*>(object);
    if (!filter) {
        throw runtime_error("BloomFilterFileManager::load -> Invalid object passed");
    }

    // Validate file existence and readability
    if (!exists(filePath)) {
        throw runtime_error("BloomFilterFileManager::load -> File not found: " + filePath);
    }

    FileReader reader(filePath);
    string line;

    // ArraySize
    if (!reader.getLine(line) || line.find("ArraySize: ") != 0) {
        throw runtime_error("BloomFilterFileManager::load -> Missing or invalid 'ArraySize:' line");
    }
    size_t arraySize = stoul(line.substr(11));

    // BitArray
    if (!reader.getLine(line) || line.find("BitArray: ") != 0) {
        throw runtime_error("BloomFilterFileManager::load -> Missing or invalid 'BitArray:' line");
    }
    string bitString = line.substr(10);
    vector<bool> bitArray;
    bitArray.reserve(bitString.size());
    for (char c : bitString) {
        if (c == '1') bitArray.push_back(true);
        else if (c == '0') bitArray.push_back(false);
        else throw runtime_error("Invalid character in BitArray: '" + string(1, c) + "'");
    }

    // HashList
    if (!reader.getLine(line) || line.find("HashList: ") != 0) {
        throw runtime_error("BloomFilterFileManager::load -> Missing or invalid 'HashList:' line");
    }
    vector<shared_ptr<IHashFunction>> hashFunctions;
    istringstream hashStream(line.substr(10));
    string hashSig;
    while (getline(hashStream, hashSig, ',')) {
        hashFunctions.push_back(HashFactory::fromSignature(hashSig));
    }

    // Blacklist
    if (!reader.getLine(line) || line.find("Blacklist: ") != 0) {
        throw runtime_error("BloomFilterFileManager::load -> Missing or invalid 'Blacklist:' line");
    }
    unordered_set<string> blacklist;
    istringstream urlStream(line.substr(11));
    string url;
    while (getline(urlStream, url, ',')) {
        blacklist.insert(url);
    }

    // --- Restore entire filter state
    filter->reset(arraySize, bitArray, hashFunctions, blacklist);
}
