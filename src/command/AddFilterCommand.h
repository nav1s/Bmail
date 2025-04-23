#pragma once

#include "../filter/IFilter.h"
#include "ICommand.h"
#include <string>

/**
 * @class AddFilterCommand
 * @brief Command to add an item (e.g., URL) to a blacklist filter.
 *
 * This class implements ICommand and provides functionality to add an item
 * to a given IFilter instance. It throws an exception if the input argument is empty.
 */
class AddFilterCommand : public ICommand {
public:
    /**
     * @brief Constructs the command with a reference to an IFilter instance.
     * @param filter A reference to a filter where items will be added.
     */
    explicit AddFilterCommand(IFilter& filter);

    /**
     * @brief Copy constructor.
     */
    AddFilterCommand(const AddFilterCommand& other);

    /**
     * @brief Copy assignment operator.
     */
    AddFilterCommand& operator=(const AddFilterCommand& other);

    /**
     * @brief Move constructor.
     */
    AddFilterCommand(AddFilterCommand&& other) noexcept;

    /**
     * @brief Move assignment operator.
     */
    AddFilterCommand& operator=(AddFilterCommand&& other) noexcept;

    /**
     * @brief Destructor.
     */
    ~AddFilterCommand() override;

    /**
     * @brief Executes the command with the given argument.
     * @param arg The item to add to the filter.
     * @throws std::invalid_argument if the argument is empty.
     */
    void execute(const std::string& arg = "") override;

private:
    IFilter* filter;  ///< Pointer to the target filter (non-owning).
};
