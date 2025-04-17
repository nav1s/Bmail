// App.cpp
#include "App.h"

// Initializes the App with given filter and menu
App::App(std::shared_ptr<IFilter> filter, std::shared_ptr<IMenu> menu)
    : filter(filter), menu(menu) {}

// Registers a new command to be executed when the given option is chosen
void App::registerCommand(int option, std::shared_ptr<ICommand> command) {
    commands[option] = command;
}

// Runs the command selection loop
void App::run() {
    while (true) {
        int choice = menu->nextCommand(); // Get user input
        if (commands.find(choice) != commands.end()) {
            commands[choice]->execute(); // Execute valid command
        } else {
            menu->displayError("Unknown command"); // Inform user of invalid choice
        }
    }
}