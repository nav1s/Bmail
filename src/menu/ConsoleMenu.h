// ===== File: ConsoleMenu.h =====
// Interface implementation for getting user input silently

#pragma once

#include "../menu/IMenu.h"
#include <string>

/**
 * @class ConsoleMenu
 * @brief Concrete implementation of IMenu that reads input from standard input (cin).
 *
 * This class is used to fetch user input in a silent mode, without printing any prompt.
 * It is also responsible for handling error messages (though in this case, it suppresses them).
 */
class ConsoleMenu : public IMenu {
public:
    /**
     * @brief Default constructor.
     */
    ConsoleMenu() = default;

    /**
     * @brief Destructor.
     */
    ~ConsoleMenu() override = default;

    /**
     * @brief Copy constructor.
     */
    ConsoleMenu(const ConsoleMenu& other) = default;

    /**
     * @brief Copy assignment operator.
     */
    ConsoleMenu& operator=(const ConsoleMenu& other) = default;

    /**
     * @brief Move constructor.
     */
    ConsoleMenu(ConsoleMenu&& other) noexcept = default;

    /**
     * @brief Move assignment operator.
     */
    ConsoleMenu& operator=(ConsoleMenu&& other) noexcept = default;
    
    /**
     * @brief Retrieves the next command from user input.
     * @return A full line of text entered by the user.
     */
    string nextCommand() override;

    /**
     * @brief Displays an error message to the user (currently suppressed).
     * @param error The error message string.
     */
    void displayError(const string& error) override;
};
