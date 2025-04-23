// ===== File: IFilter.h =====
// Interface that defines the behavior for a filter

#pragma once
#include <string>

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
    virtual bool possiblyContains(const string& item) const = 0;
};
