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
        shared_ptr<IFilter> filter;
    
        // URL string to query within the filter
        string url;
    
        // A set of URLs known to be truly blacklisted (for accuracy validation)
        set<string> realBlacklist;
public:
    /*
     * @brief Constructs a QueryFilterCommand object.
     * @param filter Shared pointer to the filter to query.
     * @param url The URL string to query.
     * @param trueBlacklist A reference set of URLs that are truly blacklisted (ground truth).
     */
    QueryFilterCommand(shared_ptr<IFilter> filter, const string& url, const set<string>& trueBlacklist);

    /*
     * @brief Destructor for the QueryFilterCommand object.
     * Cleans up any resources if necessary.
     */
    ~QueryFilterCommand();

    /*
     * @brief Copy constructor for the QueryFilterCommand object.
     * @param other Another QueryFilterCommand object to copy from.
     */
    QueryFilterCommand(const QueryFilterCommand& other);

    /*
     * @brief Copy assignment operator for the QueryFilterCommand object.
     * @param other Another QueryFilterCommand object to assign from.
     * @return Reference to this object after assignment.
     */
    QueryFilterCommand& operator=(const QueryFilterCommand& other);

    /*
     * @brief Move constructor for the QueryFilterCommand object.
     * @param other Another QueryFilterCommand object to move from.
     */
    QueryFilterCommand(QueryFilterCommand&& other) noexcept;

    /*
     * @brief Move assignment operator for the QueryFilterCommand object.
     * @param other Another QueryFilterCommand object to move from.
     * @return Reference to this object after move assignment.
     */
    QueryFilterCommand& operator=(QueryFilterCommand&& other) noexcept;

    /*
    * @brief Executes the query operation.
    * Checks if the URL is blacklisted and prints the result based on the true blacklist.
    */
    void execute() override;
};
