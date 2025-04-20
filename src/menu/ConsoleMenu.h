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
     * @brief Retrieves the next command from user input.
     * @return A full line of text entered by the user.
     */
    std::string nextCommand() override;

    /**
     * @brief Displays an error message to the user (currently suppressed).
     * @param error The error message string.
     */
    void displayError(const std::string& error) override;
};
