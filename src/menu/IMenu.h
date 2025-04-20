// ===== File: IMenu.h =====
// Interface that abstracts the user menu interaction (could be console, GUI, etc.)

#ifndef IMENU_H
#define IMENU_H

#include <string>

using namespace std;

/**
 * @class IMenu
 * @brief Interface for menu-based input.
 */
class IMenu {
public:
    /**
     * @brief Virtual destructor.
     */
    virtual ~IMenu() = default;

    /**
     * @brief Reads the next full line of input from the user.
     * @return Input line from the user.
     */
    virtual string nextCommand() = 0;

    /**
     * @brief Displays an error message to the user.
     * @param error Error message to display.
     */
    virtual void displayError(const string& error) = 0;
};

#endif // IMENU_H