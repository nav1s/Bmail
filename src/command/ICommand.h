#pragma once

#include <string>
#include "CommandResult.h"

/**
 * @interface ICommand
 * @brief Base interface for all commands.
 */
class ICommand {
public:
    virtual ~ICommand() = default;

    /**
     * @brief Executes the command and returns a CommandResult.
     * @param arg Optional argument (e.g., a URL or filename).
     * @return CommandResult indicating the result of the command execution.
     */
    virtual CommandResult execute(const std::string& arg) = 0;
};
