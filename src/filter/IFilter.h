// IFilter - Interface that defines the behavior for a filter

#ifndef IFILTER_H
#define IFILTER_H

#include <string>

class IFilter {
public:
    // default destructor
    virtual ~IFilter() = default;

    // Add an item to the blackList
    virtual void add(const string& item);

    // Query if the item is blacklisted
    virtual bool isBlacklisted(const string& item) const;
};

#endif // IFILTER_H