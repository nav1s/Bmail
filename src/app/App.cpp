// ===== File: App.cpp =====
// Logic loop that reads lines, dispatches commands based on prefix (1 or 2)

#include "App.h"
#include <sstream>

using namespace std;

// Constructor initializes shared pointers to filter and menu
App::App(shared_ptr<IFilter> filter, shared_ptr<IMenu> menu)
    : filter(filter), menu(menu) {}

// Registers a new command to be executed when the given option is chosen
void App::registerCommand(int option, shared_ptr<ICommand> command) {
    commands[option] = command;
}

// Main loop for reading user commands and dispatching corresponding actions
void App::run() {
    while (true) {
        // Get the next input line from the user (expected: <command> <url>)
        string line = menu->nextCommand();
        // break down the input line
        istringstream iss(line);
        int commandType;
        string url;
        // If input is malformed or missing parts, show error and skip this iteration
        if (!(iss >> commandType >> url)) {
            menu->displayError("Unknown command"); // Inform user of invalid choice
        }
        if (commandType == 1) {
            // Insert the URL into the actual (true) blacklist for evaluation comparison
            trueBlacklist.insert(url);
            // Create and execute AddFilterCommand to add URL to filter
            AddFilterCommand(filter, url).execute();
        } else if (commandType == 2) {
            // Create and execute QueryFilterCommand to check URL status
            QueryFilterCommand(filter, url, trueBlacklist).execute();
        }
    }
}