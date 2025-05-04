#include "ConsoleMenu.h"
#include <iostream>
#include <sstream>
#include <stdexcept>
#include "../output/OutputWriter.h"
#include "../input/InputReader.h"
#include <string>
using namespace std;

ConsoleMenu::ConsoleMenu(InputReader& reader, OutputWriter& writer)
    : reader(reader), writer(writer) {}

bool ConsoleMenu::getCommand(string& commandName, std::string& argument) const {
    // cout << "ConsoleMenu::getCommand" << endl;
    string input;
    if (!reader.getLine(input)) {
        return false; // Input reading failed
    }

    istringstream iss(input);
    if (!(iss >> commandName)) {
        throw invalid_argument("Invalid command format: missing command name.");
    }

    getline(iss, argument);
    size_t start = argument.find_first_not_of(" \t");
    argument = (start == string::npos) ? "" : argument.substr(start);
    return true; // Successfully read command and argument
}
