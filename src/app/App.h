// App.h

#ifndef APP_H
#define APP_H

#include <map>
#include <memory>
#include <string>
#include "ICommand.h"
#include "IFilter.h"
#include "IMenu.h"
#include <set>

using namespace std;

// Represents the main application class that controls the flow of commands and menu
class App {
private:
    // Maps menu options to corresponding commands
    map<int, shared_ptr<ICommand>> commands;

    // Which filter used for storing/querying URLs
    shared_ptr<IFilter> filter;

    // The menu interface (used for interaction with user)
    shared_ptr<IMenu> menu;

    // Keep the list of correct urls in a blacklist
    set<string> trueBlacklist;

public:
    // Constructor initializing the app with a filter and menu implementation
    App(shared_ptr<IFilter> filter, shared_ptr<IMenu> menu);

    // Registers a new command to a specific option in the menu
    void registerCommand(int option, shared_ptr<ICommand> command);

    // Runs the main application loop
    void run();
};

#endif // APP_H
