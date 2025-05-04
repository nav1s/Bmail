#include "ConsoleMenu.h"
#include <iostream>
#include <sstream>
#include <stdexcept>
#include "../output/OutputWriter.h"

using namespace std;

ConsoleMenu::ConsoleMenu(InputReader& reader, OutputWriter& writer)
    : reader(reader), writer(writer) {}

void ConsoleMenu::getCommand(int& commandId, std::string& argument) const {
    string input;
    if (!reader.getLine(input)) {
        throw runtime_error("Failed to read command input.");
    }

    istringstream iss(input);
    if (!(iss >> commandId)) {
        //throw std::invalid_argument("Invalid command ID format. Expected an integer.");
    }

    getline(iss, argument);
    size_t start = argument.find_first_not_of(" \t");
    argument = (start == string::npos) ? "" : argument.substr(start);
}
