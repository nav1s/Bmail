#include "App.h"
#include "../command/AddFilterCommand.h"
#include "../command/QueryFilterCommand.h"
#include "../filter/BloomFilter.h"
#include "../hash/HashFactory.h"
#include "../hash/IHashFunction.h"
#include <iostream>
#include <sstream>
#include <stdexcept>
#include "../input/CliReader.h"
#include "../input/InputReader.h"
#include <string>
#include "../menu/ConsoleMenu.h"
#include "../StringValidator/Validator.h"
#include <filesystem>
#include <regex>

using namespace std;

App::App() {
}

string bloomFilterLocation = "data";

void App::run(InputReader& reader, OutputWriter &writer) {
    //init app (bloom filter,hash functions, commands ect...)
    semiConstructor(reader, writer);

    while (true) {
        int commandId;
        string arg;
        menu->getCommand(commandId, arg);
        //fetch command and calls it
        auto it = commands.find(commandId);
        if (it != commands.end()) {
            try {
                it->second->execute(arg);
                 // "add" command
                if (commandId == 1) {
                    filter->saveToFile(bloomFilterLocation);
                }
            } catch (const std::exception& ex) {
                continue;
            }
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
    commands[1] = make_unique<AddFilterCommand>(*filter);
    commands[2] = make_unique<QueryFilterCommand>(*filter, writer);
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
