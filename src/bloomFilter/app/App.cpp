#include "App.h"
#include "../command/AddFilterCommand.h"
#include "../command/DeleteFilterCommand.h"
#include "../command/ICommand.h"
#include "../command/QueryFilterCommand.h"
#include "../input/InputReader.h"
#include "../menu/ConsoleMenu.h"
#include "../output/OutputWriter.h"
#include <iostream>
#include <stdexcept>
#include <string>

using namespace std;

App::App() {
}

void App::run(InputReader &reader, OutputWriter &writer, shared_ptr<IFilter> filter) {
    semiConstructor(reader, writer, filter);

    while (true) {
        string commandName, arg;
        try {
            bool commandsuccess = menu->getCommand(commandName, arg);
            if (!commandsuccess) {
                break;
            }

            auto it = commands.find(commandName);
            if (it != commands.end() && !arg.empty()) {
                CommandResult result = it->second->execute(arg);

                if (commandName != "GET") {
                    menu->displayResult(result);
                }

                if (commandName == "POST" || commandName == "DELETE") {
                    filter->saveToFile();
                }
            } else {
                menu->displayResult(CommandResult::BAD_REQUEST_400);
            }

        } catch (const invalid_argument &) {
            menu->displayResult(CommandResult::BAD_REQUEST_400);
        } catch (const runtime_error &) {
            menu->displayResult(CommandResult::NOT_FOUND_404);
        }
    }

    filter->saveToFile();
    std::cout << "Client disconnected" << std::endl;
}

/* @brief semiConstructor
 * @param reader InputReader& reader
 * @param writer OutputWriter& writer
 * @details This function initializes the BloomFilter and its hash functions.
 * It also loads the filter from a file if it exists.
 * The function takes an InputReader and an OutputWriter as parameters.
 */
void App::semiConstructor(InputReader &reader, OutputWriter &writer, shared_ptr<IFilter> filter) {
    // creating commands and menu
    registerCommands(writer, filter);
    menu = make_unique<ConsoleMenu>(reader, writer);
}

void App::registerCommands(OutputWriter &writer, shared_ptr<IFilter> filter) {
    commands["POST"] = make_unique<AddFilterCommand>(*filter, writer);
    commands["GET"] = make_unique<QueryFilterCommand>(*filter, writer);
    commands["DELETE"] = make_unique<DeleteFilterCommand>(*filter, writer);
}
