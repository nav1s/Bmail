// IFilter - Interface that defines the behavior for a filter

#ifndef IFILTER_H
#define IFILTER_H

#include <string>

class IFilter {
public:
    // default destructor
    virtual ~IFilter() = default;

    // Add a URL to the filter
    virtual bool add(const std::string& item) = 0;

    // Query if the URL exists in the filter
    virtual bool queryUrl(const std::string& item) = 0;
};

#endif // IFILTER_H