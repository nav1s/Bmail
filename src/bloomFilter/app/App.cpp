#include "App.h"
using namespace std;

App::App() {
}

void App::run(InputReader &reader, OutputWriter &writer, shared_ptr<IFilter> filter, shared_ptr<std::mutex> filterMutex) {
    // creating commands and menu
    registerCommands(writer, filter, filterMutex);
    menu = make_unique<ConsoleMenu>(reader, writer);

    while (true) {
        string commandName, arg;
        try {
            bool commandsuccess = menu->getCommand(commandName, arg);
            // If the command is empty, break the loop
            if (!commandsuccess || commandName.empty() ) {
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
}

void App::registerCommands(OutputWriter &writer, shared_ptr<IFilter> filter, shared_ptr<std::mutex> filterMutex) {
    commands["POST"] = make_unique<AddFilterCommand>(*filter, writer, filterMutex);
    commands["GET"] = make_unique<QueryFilterCommand>(*filter, writer, filterMutex);
    commands["DELETE"] = make_unique<DeleteFilterCommand>(*filter, writer, filterMutex);
}
