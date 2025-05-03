#pragma once

#include "../filter/IFilter.h"
#include "ICommand.h"
#include <string>
#include "../Output/OutputWriter.h"

/**
 * @class QueryFilterCommand
 * @brief Command to check if a given item (e.g., URL) is blacklisted in the filter.
 *
 * This command queries an IFilter instance and checks whether the provided input
 * is currently blacklisted. It outputs the result using the provided OutputWriter.
 * Throws an exception if the input is empty or invalid.
 */
class QueryFilterCommand : public ICommand {
public:
    /**
     * @brief Constructor.
     * @param filter Reference to an IFilter object for querying.
     * @param writer Reference to an OutputWriter used to print results.
     */
    explicit QueryFilterCommand(IFilter& filter, OutputWriter& writer);

    /**
     * @brief Copy constructor.
     * @param other The other QueryFilterCommand to copy from.
     */
    QueryFilterCommand(const QueryFilterCommand& other);

    /**
     * @brief Copy assignment operator.
     * @param other The other QueryFilterCommand to assign from.
     * @return Reference to this object.
     */
    QueryFilterCommand& operator=(const QueryFilterCommand& other);

    /**
     * @brief Move constructor.
     * @param other The other QueryFilterCommand to move from.
     */
    QueryFilterCommand(QueryFilterCommand&& other) noexcept;

    /**
     * @brief Move assignment operator.
     * @param other The other QueryFilterCommand to assign from.
     * @return Reference to this object.
     */
    QueryFilterCommand& operator=(QueryFilterCommand&& other) noexcept;

    /**
     * @brief Destructor.
     */
    ~QueryFilterCommand() override;

    /**
     * @brief Executes the command with the given argument.
     * @param arg The item (e.g., URL) to query in the filter.
     * @throws std::invalid_argument if the argument is missing or invalid.
     */
    CommandResult execute(const std::string& arg = "") override;

private:
    IFilter* filter;
    OutputWriter* writer;
};
