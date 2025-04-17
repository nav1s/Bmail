#include <vector>
#include <string>
#include <functional>
#include <unordered_set>

using namespace std;
using HashFunction = function<size_t(const string&)>;

/**
 * @class BloomFilter
 * @brief A filter for checking membership of items (e.g., URLs) using a probabilistic approach.
 *
 * This BloomFilter class uses a set of hash functions to perform probabilistic membership testing.
 * False positives are possible, but false negatives are not.
 * A real blacklist can be used to confirm actual membership.
 */
class BloomFilter {
public:
    /**
     * @brief Constructs a BloomFilter.
     * @param size The size of the bit array.
     * @param hashFuncs A list of hash functions to use.
     // need to check what about array size 0 functionallity
     */
     BloomFilter(size_t size, const vector<HashFunction>& hashFuncs){
        /*if (arraySize == 0 || hashFunctions.empty()) {
            throw invalid_argument("Bit array size and hash functions must be non-zero.");
        } */       
        arraySize = size;
        bitArray.resize(arraySize);
        fill(bitArray.begin(), bitArray.end(), false);
        hashFunctions = hashFuncs;
    }

    /**
     * @brief Adds an item to the Bloom filter and the real blacklist.
     * also resizes the bit array if it is more than 70% full.
     * @param item The string to add.
     */
    void add(const string& item){
        // Add to blacklist
        realBlacklist.insert(item);
        // Check if the array is more than 70% full
        if(checkArraySize()){
            resizeArray();
        }
        // Updates the bit array
        for (const HashFunction& hashFunc : hashFunctions) {
            size_t i = getIndex(hashFunc, item);
            bitArray[i] = true;
        }
    }

    /**
     * @brief Checks if an item is possibly in the Bloom filter.
     * @param item The string to check.
     * @return True if it might be in the filter, false if definitely not.
     */
    bool isBlacklisted(const string& item) const{
        if (possiblyContains(item)) {
            return isActuallyBlacklisted(item);
        }
        return false;
    }

    /**
     * @brief Saves the bit array and blacklist to a file.
     * @param path The file path to save to.
     */
    void saveToFile(const string& path) const;

    /**
     * @brief Loads the bit array and blacklist from a file.
     * @param path The file path to load from.
     */
    void loadFromFile(const string& path);

private:
    size_t arraySize;                          // The number of bits in the Bloom filter.
    vector<bool> bitArray;                // The bit array representing the Bloom filter.
    vector<HashFunction> hashFunctions;   // The list of hash functions used.
    unordered_set<string> realBlacklist; // Real blacklist to prevent false positives.

    /**
     * @brief compute the index from a hash function and input using mudulo.
     * @param hashFunc The hash function to use.
     * @param item The string to hash.
     * @return The bit index for this item.
     */
    size_t getIndex(const HashFunction& hashFunc, const string& item) const{
        return hashFunc(item) % arraySize; 
    }

    /**
     * @brief Checks if an item is possibly in the Bloom filter.
     * @param item The string to check.
     * @return True if it might be in the filter, false if definitely not.
     */
     bool possiblyContains(const string& item) const{
        for (const HashFunction& hashFunc : hashFunctions) {
            size_t i = getIndex(hashFunc, item);
            if (bitArray[i]) {
                return true; // Possibly in the filter
            }
        }
        return false;
    }

    /**
     * @brief Checks if an item is actually in the real blacklist.
     * Used to confirm if a positive result is a false positive.
     * @param item The string to check.
     * @return True if it is in the blacklist, false otherwise.
     */
    bool isActuallyBlacklisted(const string& item) const{
        return realBlacklist.find(item) != realBlacklist.end();
    }

    /**
     * @brief Resizes the bit array and rehashes the real blacklist.
     * @param newSize The new size of the bit array.
     */
    void resizeArray() {
        arraySize = arraySize * 2;
        bitArray.resize(arraySize);
        fill(bitArray.begin(), bitArray.end(), false);
        for(const string& item : realBlacklist) {
            for (const HashFunction& hashFunc : hashFunctions) {
                size_t i = getIndex(hashFunc, item);
                bitArray[i] = true;
            }
        }
    }

    /**
        * @brief Checks if the bit array is more than 70% full.
        * @return True if the array is more than 70% full, false otherwise.
     */
    bool checkArraySize(){
        int count=0;
        for (size_t i = 0; i < arraySize; ++i) {
            if (bitArray[i]) {
                count++;
            }
        }
        return count > arraySize * 0.7;
    }

};
