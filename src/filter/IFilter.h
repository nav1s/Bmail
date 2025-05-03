#pragma once

#include <string>
using namespace std;

/**
 * @class IFilter
 * @brief Abstract interface for a blacklist filter.
 */
class IFilter {
public:
    /*
    * @brief Virtual destructor
    */
    virtual ~IFilter() = default;
    /**
     * @brief Adds an item to the blacklist.
     * @param item The string to add.
     */
    virtual void add(const std::string& item) = 0;

    /**
     * @brief removes an item from the Bloom filter.
     * @param item The string to remove from the filter.
     */
    virtual void remove(const string& item) = 0;

    /**
     * @brief Checks if an item is blacklisted.
     * @param item The string to check.
     * @return True if item is blacklisted.
     */
    virtual bool isBlacklisted(const std::string& item) const = 0;

    /**
     * @brief Checks if an item is possibly in the filter based on the bit array.
     * @param item The item to check.
     * @return True if all relevant bits are set, false otherwise.
     * 
     * might be removed from Interface after this assignment since false positive is not required in other filters
     */
    virtual bool possiblyContains(const std::string& item) const = 0;

    /**
     * @brief Saves the filter to a file.
     */
    virtual void saveToFile(const std::string& path) const = 0;

    /**
     * @brief Loads the filter from a file.
     */
    virtual void loadFromFile(const std::string& path) = 0;
};
