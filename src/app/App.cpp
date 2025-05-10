#include "App.h"
#include "../command/AddFilterCommand.h"
#include "../command/QueryFilterCommand.h"
#include "../command/DeleteFilterCommand.h"
#include "../command/ICommand.h"
#include "../output/OutputWriter.h"
#include "../filter/BloomFilter.h"
#include "../hash/HashFactory.h"
#include "../hash/IHashFunction.h"
#include <sstream>
#include <stdexcept>
#include "../input/InputReader.h"
#include "../menu/ConsoleMenu.h"
#include <filesystem>
#include <iostream>
#include <regex>
#include <sstream>
#include <string>

using namespace std;

App::App() {
}

string bloomFilterLocation = "../../data";

void App::run(InputReader &reader, OutputWriter &writer, vector<int> &args) {
    semiConstructor(reader, writer, args);

    while (true) {
        string commandName, arg;
        try {
            bool commandsuccess = menu->getCommand(commandName, arg);

            if (commandName.empty() || !commandsuccess) {
                break;
            }

            auto it = commands.find(commandName);
            if (it != commands.end() && !arg.empty()) {
                CommandResult result = it->second->execute(arg);

                if (commandName != "GET") {
                    menu->displayResult(result);
                }

                if (commandName == "POST" || commandName == "DELETE") {
                    filter->saveToFile(bloomFilterLocation);
                }
            } else {
                menu->displayResult(CommandResult::BAD_REQUEST_400);
            }

        } catch (const invalid_argument&) {
            menu->displayResult(CommandResult::BAD_REQUEST_400);
        } catch (const runtime_error&) {
            menu->displayResult(CommandResult::NOT_FOUND_404);
        }
    }

    filter->saveToFile(bloomFilterLocation);
}


/* @brief semiConstructor
 * @param reader InputReader& reader
 * @param writer OutputWriter& writer
 * @details This function initializes the BloomFilter and its hash functions.
 * It also loads the filter from a file if it exists.
 * The function takes an InputReader and an OutputWriter as parameters.
 */
void App::semiConstructor(InputReader &reader, OutputWriter &writer, vector<int> &args) {
    size_t arraySize = args.front();
    args.erase(args.begin());

    // creating hash functions and filter
    vector<shared_ptr<IHashFunction>> hashFunctions;
    hashAssembler(args, hashFunctions);
    filter = make_shared<BloomFilter>(arraySize, hashFunctions);
    // loading from file if optional
    if (filesystem::exists(bloomFilterLocation)) {
        filter->loadFromFile(bloomFilterLocation);
    }

    // creating commands and menu
    registerCommands(writer);
    menu = make_unique<ConsoleMenu>(reader, writer);
}

void App::registerCommands(OutputWriter& writer) {
    commands["POST"] = make_unique<AddFilterCommand>(*filter, writer);
    commands["GET"] = make_unique<QueryFilterCommand>(*filter, writer);
    commands["DELETE"] = make_unique<DeleteFilterCommand>(*filter, writer);
}

void App::parseInput(const string &input, vector<int> &args) {
    istringstream iss(input);
    int val;
    while (iss >> val) {
        args.push_back(val);
    }
}

/* @brief hashAssembler
 * @param args vector<int>& args
 * @param out vector<shared_ptr<IHashFunction>>& out
 * @details This function creates hash functions based on the provided arguments.
 * The arguments are expected to be integers representing the hash function types.
 */
void App::hashAssembler(vector<int> &args, vector<shared_ptr<IHashFunction>> &out) {
    for (int num : args) {
        string signature = "std:" + to_string(num);
        out.push_back(HashFactory::fromSignature(signature));
    }
}

/* @brief isValidInit
 * @param input string& input
 * @return bool
 * @details This function checks if the input string is a valid initialization string.
 * A valid initialization string consists of positive integers separated by spaces.
 */
bool App::isValidInit(const string& input) {
    std::regex pattern(R"(^([1-9][0-9]*)( [1-9][0-9]*)*$)");
    return regex_match(input, pattern);
}
