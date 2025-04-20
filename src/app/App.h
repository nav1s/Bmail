// ===== File: App.h =====
// Main controller class that connects the filter, menu, and commands

#ifndef APP_H
#define APP_H

#include <map>
#include <memory>
#include <string>
#include <set>
#include "../command/ICommand.h"
#include "../filter/IFilter.h"
#include "../menu/IMenu.h"
#include "../command/AddFilterCommand.h"
#include "../command/QueryFilterCommand.h"
#include "../filter/BloomFilter.h"
#include "../menu/ConsoleMenu.h"

/**
 * @class App
 * @brief Main application class managing the command flow.
 */
class App {
private:
    // Maps menu options to corresponding commands
    map<int, shared_ptr<ICommand>> commands;

    // The Filter which is used for storing/querying URLs
    shared_ptr<IFilter> filter;

    // The menu interface (used for interaction with user)
    shared_ptr<IMenu> menu;

    // Keep the list of correct urls in a blacklist
    set<string> trueBlacklist;

public:
    /**
     * @brief Constructs the App.
     * @param filter Shared pointer to the IFilter implementation.
     * @param menu Shared pointer to the IMenu implementation.
     */
    App(shared_ptr<IFilter> filter, shared_ptr<IMenu> menu);

    /**
     * @brief Starts the application run loop.
     */
    void run();

    // Registers a new command to a specific option in the menu
    void registerCommand(int option, shared_ptr<ICommand> command);
};

#endif // APP_H
