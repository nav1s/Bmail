#include "App.h"
#include "../command/AddFilterCommand.h"
#include "../command/QueryFilterCommand.h"
#include "../command/DeleteFilterCommand.h"
#include "../command/ICommand.h"
#include "../Output/OutputWriter.h"
#include "../filter/BloomFilter.h"
#include "../hash/HashFactory.h"
#include "../hash/IHashFunction.h"
#include <iostream>
#include <sstream>
#include <stdexcept>
#include "../input/InputReader.h"
#include <string>
#include "../menu/ConsoleMenu.h"
#include "../StringValidator/Validator.h"
#include <filesystem>
#include <regex>

using namespace std;

App::App() {
}

string bloomFilterLocation = "../../data";

void App::run(InputReader& reader, OutputWriter& writer) {
    // cout << "App::run" << endl;
    //init app (bloom filter,hash functions, commands ect...)
    semiConstructor(reader, writer);

    while (true) {
        string commandName, arg;

        try {
            // gets the command and argument from the user
            menu->getCommand(commandName, arg);

            if (commandName.empty()) {
                break;
            }

            // find the command in the map
            auto it = commands.find(commandName);
            cout << "[DEBUG] Executing command: " << commandName << " with arg: " << arg << endl;
            if (it != commands.end() && !arg.empty()) {
                CommandResult result = it->second->execute(arg);
                // cout << "[DEBUG] Command executed successfully." << endl;
                switch (result) {
                    case CommandResult::CREATED_201:
                        writer.putLine("201 Created");
                        break;
                    case CommandResult::NO_CONTENT_204:
                        writer.putLine("204 No Content");
                        break;
                    case CommandResult::OK_200:
                        // writer.putLine("200 OK");
                        break;
                    case CommandResult::NOT_FOUND_404:
                        writer.putLine("404 Not Found");
                        break;
                    case CommandResult::BAD_REQUEST_400:
                        writer.putLine("400 Bad Request");
                        break;
                }
                if (commandName == "POST" || commandName == "DELETE") {
                    filter->saveToFile(bloomFilterLocation);
                }
            } else {
                writer.putLine("400 Bad Request");
            }
        } catch (const invalid_argument& e) {
            writer.putLine("400 Bad Request");
            continue;
        } catch (const runtime_error& e) {
            writer.putLine("404 Not Found");
            continue;
        } catch (const std::exception& e) {
            writer.putLine("500 Internal Server Error");
            continue;
        }
    }
    filter->saveToFile(bloomFilterLocation);
}

void App::semiConstructor(InputReader& reader, OutputWriter &writer) {
    //get init line from user
    string input;
    bool validInit = false;
    do{
        reader.getLine(input);
    }while(!isValidInit(input));

    vector<int> args;
    parseInput(input, args);
    if (!Validator::validatePositiveIntegers(args)) {
        throw std::invalid_argument("Incorrect filter init format.");
    }
    size_t arraySize = args.front();
    args.erase(args.begin());

    //creating hash functions and filter
    vector<shared_ptr<IHashFunction>> hashFunctions;
    hashAssembler(args, hashFunctions);
    filter = make_shared<BloomFilter>(arraySize, hashFunctions);
    //loading from file if optional
    if (filesystem::exists(bloomFilterLocation)){
        filter->loadFromFile(bloomFilterLocation);
    }

    //creating commands and menu
    registerCommands(writer);
    menu = make_unique<ConsoleMenu>(reader, writer);
}

void App::registerCommands(OutputWriter& writer) {
    commands["POST"] = make_unique<AddFilterCommand>(*filter, writer);
    commands["GET"] = make_unique<QueryFilterCommand>(*filter, writer);
    commands["DELETE"] = make_unique<DeleteFilterCommand>(*filter, writer);
}

void App::parseInput(const string& input, vector<int>& args) {
    istringstream iss(input);
    int val;
    while (iss >> val) {
        args.push_back(val);
    }
}

void App::hashAssembler(vector<int>& args, vector<shared_ptr<IHashFunction>>& out) {
    for (int num : args) {
        string signature = "std:" + to_string(num);
        out.push_back(HashFactory::fromSignature(signature));
    }
}

bool App::isValidInit(const string& input) {
    static const regex pattern("^[1-9 ]+$");
    return regex_match(input, pattern);
}
