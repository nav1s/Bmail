// App.cpp

#include "App.h"
#include "AddFilterCommand.h"
#include "QueryFilterCommand.h"
#include <sstream>

using namespace std;

// Initializes the App with given filter and menu
App::App(shared_ptr<IFilter> filter, shared_ptr<IMenu> menu)
    : filter(filter), menu(menu) {}

// Registers a new command to be executed when the given option is chosen
void App::registerCommand(int option, shared_ptr<ICommand> command) {
    commands[option] = command;
}

// Runs the command selection loop
void App::run() {
    while (true) {
        string line = menu->nextCommand();
        // break down the input line
        istringstream iss(line);
        int commandType;
        string url;
        if (!(iss >> commandType >> url)) {
            menu->displayError("Unknown command"); // Inform user of invalid choice
        }

        if (commandType == 1) {
            trueBlacklist.insert(url);
            AddFilterCommand(filter, url).execute();
        } else if (commandType == 2) {
            QueryFilterCommand(filter, url, trueBlacklist).execute();
        }
    }
}