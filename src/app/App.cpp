// ===== File: App.cpp =====
// Logic loop that reads lines, dispatches commands based on prefix (1, 2, etc.) using ICommand interface

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
 urlValidator(other.urlValidator)
 {}

// Copy assignment
App& App::operator=(const App& other) {
    if (this != &other) {
    commands = other.commands;
    filter = other.filter;
    menu = other.menu;
    inputReader = other.inputReader;
    urlValidator = other.urlValidator;
    }
    return *this;
}

// Move constructor
App::App(App&& other) noexcept
: commands(std::move(other.commands)),
 filter(std::move(other.filter)),
 menu(std::move(other.menu)),
 inputReader(std::move(other.inputReader)),
 urlValidator(std::move(other.urlValidator))
{}

// Move assignment
App& App::operator=(App&& other) noexcept {
    if (this != &other) {
    commands = std::move(other.commands);
    filter = std::move(other.filter);
    menu = std::move(other.menu);
    inputReader = std::move(other.inputReader);
    urlValidator = std::move(other.urlValidator);
    }
    return *this;
}

void App::registerCommand(int type, std::function<void(const std::string&)> commandFactoryFunc) {
    commands[type] = std::move(commandFactoryFunc);
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

        // Dispatch based on command type using SOLID OCP principle
        auto function = commands.find(commandType);
        if (function != commands.end()) {
            function->second(url); // send the URL to the relevant function
        } else {
            menu->displayError("Invalid option");
        }
    }
}
