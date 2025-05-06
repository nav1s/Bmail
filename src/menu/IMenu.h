#pragma once

#include "../command/CommandResult.h"
#include <string>

/**
 * @interface IMenu
 * @brief Interface for a user-facing menu that prompts and receives command input.
 */
class IMenu {
public:
    /**
     * @brief Virtual destructor.
     */
    virtual ~IMenu() = default;

    /**
     * @brief retrieves their selected command and argument.
     * 
     * @param commandName Output parameter for the command name.
     * @param argument Output parameter for the remainder of the input (e.g. a URL).
     */
    virtual bool getCommand(std::string& commandName, std::string& argument) const = 0;

    /**
     * @brief Displays a message to the user.
     * @param message The message to display.
     */
    virtual void displayMessage(const std::string& message) const = 0;

    /**
     * @brief Displays a predefined message based on the command result.
     * converts the CommandResult enum to a string and displays it.
     * @param result The CommandResult enum value.
     */
    virtual void displayResult(const CommandResult& result) const = 0;
};
