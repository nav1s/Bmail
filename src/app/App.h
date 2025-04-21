// ===== File: App.h =====
// Main controller class that connects the filter, menu, and commands

#ifndef APP_H
#define APP_H

#include <map>
#include <memory>
#include <string>
#include <set>
#include <functional>
#include "../command/ICommand.h"
#include "../filter/IFilter.h"
#include "../menu/IMenu.h"
#include "../command/AddFilterCommand.h"
#include "../command/QueryFilterCommand.h"
#include "../filter/BloomFilter.h"
#include "../menu/ConsoleMenu.h"
#include "../input/InputReader.h"
#include "../StringValidator/UrlValidator.h"

/**
 * @class App
 * @brief Main application class managing the command flow.
 */
class App {
private:
    // Maps menu options to corresponding commands
    map<int, function<void(const string&)>> commands;

    // The Filter which is used for storing/querying URLs
    shared_ptr<IFilter> filter;

    // The menu interface (used for interaction with user)
    shared_ptr<IMenu> menu;

    // Reader for user input (e.g., from CLI or file)
    shared_ptr<InputReader> inputReader;

    // Validator for checking URL format and logic
    shared_ptr<UrlValidator> urlValidator;
public:
     /**
     * @brief Constructs the App with all dependencies.
     * @param filter Shared pointer to the IFilter implementation.
     * @param menu Shared pointer to the IMenu implementation.
     * @param inputReader Shared pointer to the InputReader.
     * @param urlValidator Shared pointer to the UrlValidator.
     */
    App(shared_ptr<IFilter> filter,
        shared_ptr<IMenu> menu,
        shared_ptr<InputReader> inputReader,
        shared_ptr<UrlValidator> urlValidator);

    /** @brief Destructor */
    ~App();

    /** @brief Copy constructor */
    App(const App& other);

    /** @brief Copy assignment operator */
    App& operator=(const App& other);

    /** @brief Move constructor */
    App(App&& other) noexcept;

    /** @brief Move assignment operator */
    App& operator=(App&& other) noexcept;

    /**
     * @brief Starts the application run loop.
     */
    void run();

    /**
     * @brief Registers a new command to a specific option in the menu.
     * @param option The menu option number.
     * @param command The command associated with the option.
     */
    void registerCommand(int type, function<void(const string&)> commandFactoryFunc);
};

#endif // APP_H
