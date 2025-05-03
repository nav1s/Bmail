#pragma once

#include "../filter/IFilter.h"
#include "ICommand.h"
#include <string>
#include "../Output/OutputWriter.h"

/**
 * @class DeleteFilterCommand
 * @brief Command to remove an item (e.g., URL) from a blacklist filter.
 *
 * This class implements ICommand and provides functionality to remove an item
 * from a given IFilter instance. It throws an exception if the input argument is empty or invalid.
 */
class DeleteFilterCommand : public ICommand {
public:
    /**
     * @brief Constructs the command with a reference to an IFilter instance and an output writer.
     * @param filter A reference to a filter where items will be removed.
     * @param writer A reference to an output writer for feedback.
     */
    DeleteFilterCommand(IFilter& filter, OutputWriter& writer);

    /** @brief Copy constructor. */
    DeleteFilterCommand(const DeleteFilterCommand& other);

    /** @brief Copy assignment operator. */
    DeleteFilterCommand& operator=(const DeleteFilterCommand& other);

    /** @brief Move constructor. */
    DeleteFilterCommand(DeleteFilterCommand&& other) noexcept;

    /** @brief Move assignment operator. */
    DeleteFilterCommand& operator=(DeleteFilterCommand&& other) noexcept;

    /** @brief Destructor. */
    ~DeleteFilterCommand() override;

    /**
     * @brief Executes the command with the given argument.
     * @param arg The item to remove from the filter.
     * @throws std::invalid_argument if the argument is empty or invalid.
     */
    CommandResult execute(const std::string& arg = "") override;

private:
    IFilter* filter;
    OutputWriter* writer;
};
