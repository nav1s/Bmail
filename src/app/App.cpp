// ===== File: App.cpp =====
// Logic loop that reads lines, dispatches commands based on prefix (1 or 2)

#include "App.h"
#include <sstream>

using namespace std;

// Constructor initializes shared pointers to filter, menu, inputReader, and urlValidator
App::App(shared_ptr<IFilter> filter,
    shared_ptr<IMenu> menu,
    shared_ptr<InputReader> inputReader,
    shared_ptr<UrlValidator> urlValidator)
: filter(filter), menu(menu), inputReader(inputReader), urlValidator(urlValidator) {}

// Destructor
App::~App() = default;

// Copy constructor
App::App(const App& other)
: commands(other.commands),
 filter(other.filter),
 menu(other.menu),
 inputReader(other.inputReader),
 urlValidator(other.urlValidator),
 trueBlacklist(other.trueBlacklist) {}

// Copy assignment
App& App::operator=(const App& other) {
    if (this != &other) {
    commands = other.commands;
    filter = other.filter;
    menu = other.menu;
    inputReader = other.inputReader;
    urlValidator = other.urlValidator;
    trueBlacklist = other.trueBlacklist;
    }
    return *this;
}

// Move constructor
App::App(App&& other) noexcept
: commands(move(other.commands)),
 filter(move(other.filter)),
 menu(move(other.menu)),
 inputReader(move(other.inputReader)),
 urlValidator(move(other.urlValidator)),
 trueBlacklist(move(other.trueBlacklist)) {}

// Move assignment
App& App::operator=(App&& other) noexcept {
    if (this != &other) {
    commands = move(other.commands);
    filter = move(other.filter);
    menu = move(other.menu);
    inputReader = move(other.inputReader);
    urlValidator = move(other.urlValidator);
    trueBlacklist = move(other.trueBlacklist);
    }
    return *this;
}

// Registers a new command to be executed when the given option is chosen
void App::registerCommand(int option, shared_ptr<ICommand> command) {
    commands[option] = command;
}

// Main loop for reading user commands and dispatching corresponding actions
void App::run() {
    while (true) {
        string line; // To hold the current input line
        // Try to read a line using the inputReader
        if (!inputReader->getLine(line)) { // If failed or EOF
            menu->displayError("No more input or failed to read."); // Show message
            break; // Exit loop
        }

        istringstream iss(line); // Create stream to parse line
        int commandType; // First token: 1 or 2
        string url; // Second token: URL string

        if (!(iss >> commandType >> url)) { // If line malformed
            menu->displayError("Unknown command"); // Inform user
            continue; // Skip to next loop iteration
        }

    if (!urlValidator->validate(url)) {
        menu->displayError("Invalid URL format");
        continue;
    }

    // adding command
    if (commandType == 1) {
        trueBlacklist.insert(url);
        AddFilterCommand(filter, url).execute();
    } else if (commandType == 2) {
        QueryFilterCommand(filter, url, trueBlacklist).execute();
    } else {
        menu->displayError("Invalid option");
    }
    }
}
