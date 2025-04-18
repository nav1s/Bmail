// IMenu - Interface that abstracts the user menu interaction (could be console, GUI, etc.)

#ifndef IMENU_H
#define IMENU_H

#include <string>

class IMenu {
public:
    virtual ~IMenu() = default;

    // Returns the user choice as an int
    virtual string nextCommand() = 0;

    // Displays an error message to the user
    virtual void displayError(const std::string& error) = 0;
};

#endif // IMENU_H