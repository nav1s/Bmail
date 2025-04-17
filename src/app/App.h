// App.h
#ifndef APP_H
#define APP_H

#include <map>
#include <string>
#include <memory>

#include "C:\BarIlan\Year3\AdvancedPrograming\Exercise1\project\src\command\ICommand.h"
#include "C:\BarIlan\Year3\AdvancedPrograming\Exercise1\project\src\filter\IFilter.h"
#include "C:\BarIlan\Year3\AdvancedPrograming\Exercise1\project\src\menu\IMenu.h"

// Represents the main application class that controls the flow of commands and menu
class App {
private:
    // Maps menu options to corresponding commands
    std::map<int, std::shared_ptr<ICommand>> commands;

    // Which filter used for storing/querying URLs
    std::shared_ptr<IFilter> filter;

    // The menu interface (used for interaction with user)
    std::shared_ptr<IMenu> menu;

public:
    // Constructor initializing the app with a filter and menu implementation
    App(std::shared_ptr<IFilter> filter, std::shared_ptr<IMenu> menu);

    // Registers a new command to a specific option in the menu
    void registerCommand(int option, std::shared_ptr<ICommand> command);

    // Runs the main application loop
    void run();
};

#endif // APP_H
