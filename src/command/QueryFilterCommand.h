// ===== File: QueryFilterCommand.h =====
// Command for querying a URL in the filter and comparing with true blacklist

#pragma once

#include "../command/ICommand.h"
#include "../filter/IFilter.h"
#include <memory>
#include <string>
#include <set>

// QueryFilterCommand checks if a given URL exists in the filter
// and compares the result against a known set of blacklisted URLs.
class QueryFilterCommand : public ICommand {
    private:
        // Shared pointer to the filter used for checking blacklist status
        std::shared_ptr<IFilter> filter;
    
        // URL string to query within the filter
        std::string url;
    
        // A set of URLs known to be truly blacklisted (for accuracy validation)
        std::set<std::string> realBlacklist;
public:
    /**
    * @brief Constructs a QueryFilterCommand object.
    * @param filter Shared pointer (high-level abstraction, Manages the lifetime of dynamically allocated memory)
    *  to the filter to query.
    * @param url The URL string to query.
    * @param trueBlacklist A reference set of URLs that are truly blacklisted (ground truth).
    *
    * This constructor stores the URL and ground truth set. It also moves ownership
    * of the filter shared pointer.
    */
    QueryFilterCommand(shared_ptr<IFilter> filter, const string&, const set<string>&);

    /*
    * @brief Executes the query operation.
    */
    void execute() override;
};
