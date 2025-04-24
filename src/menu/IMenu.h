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
     * @brief Prompts the user and retrieves their selected command and argument.
     * 
     * @param commandId Output parameter for the command number (e.g. 1, 2).
     * @param argument Output parameter for the remainder of the input (e.g. a URL).
     */
    virtual void getCommand(int& commandId, std::string& argument) const = 0;
};
