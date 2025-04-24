#pragma once

#include <string>

/**
 * @interface ICommand
 * @brief Base interface for all commands.
 */
class ICommand {
public:
    virtual ~ICommand() = default;

    /**
     * @brief Executes the command with an optional string argument.
     * @param arg Optional argument (e.g., a URL or filename).
     */
    virtual void execute(const std::string& arg = "") = 0;
};
