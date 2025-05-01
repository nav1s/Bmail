#pragma once

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
    virtual void getCommand(string& commandName, std::string& argument) const = 0;
};
