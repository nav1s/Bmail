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

using namespace std;

App::App() {
}

void App::run(InputReader& reader, OutputWriter &writer) {
    //init app (bloom filter,hash functions, commands ect...)
    semiConstructor(reader, writer);

    while (true) {
        int commandId;
        string arg;
        menu->getCommand(commandId, arg);
        try {
            commands.at(commandId)->execute(arg);
        }
        catch (...) {
            //need to implement what it should do
            continue;
        }
    }
}

void App::semiConstructor(InputReader& reader, OutputWriter &writer) {
    //get input from user
    string input;
    reader.getLine(input);
    vector<int> args;
    parseInput(input, args);
    //need to add validate input

    size_t arraySize = args.front();
    args.erase(args.begin());

    //creating hash functions and filter
    vector<shared_ptr<IHashFunction>> hashFunctions;
    hashAssembler(args, hashFunctions);
    filter = make_shared<BloomFilter>(arraySize, hashFunctions);

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
