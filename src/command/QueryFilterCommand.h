// ===== File: QueryFilterCommand.h =====
// Command for querying a URL in the filter and comparing with true blacklist

#pragma once

#include "../command/ICommand.h"
#include "../filter/IFilter.h"
#include <memory>
#include <string>
#include <set>

/**
 * @class QueryFilterCommand
 * @brief Represents a command that queries a URL against a Bloom filter.
 *
 * This class uses the filter to determine if a URL is blacklisted,
 * delegating all blacklist logic to the filter implementation.
 */
class QueryFilterCommand : public ICommand {
    private:
        // Shared pointer to the filter used for checking blacklist status
        std::shared_ptr<IFilter> filter;
    
        // URL string to query within the filter
        std::string url;
public:
    /*
     * @brief Constructs a QueryFilterCommand object.
     * @param filter Shared pointer to the filter to query.
     * @param url The URL string to query.
     * @param trueBlacklist A reference set of URLs that are truly blacklisted (ground truth).
     */
    QueryFilterCommand(std::shared_ptr<IFilter> filter, const std::string& url);

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
    bool execute() override;
};
