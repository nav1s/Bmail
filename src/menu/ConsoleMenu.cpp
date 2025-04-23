#include "ConsoleMenu.h"
#include <iostream>
#include <sstream>
#include <stdexcept>
#include "../Output/OutputWriter.h"

using namespace std;

ConsoleMenu::ConsoleMenu(InputReader& reader, OutputWriter& writer)
    : reader(reader), writer(writer) {}

void ConsoleMenu::getCommand(int& commandId, string& argument) const {
    string input;
    if (!reader.getLine(input)) {
        throw runtime_error("Failed to read command input.");
    }

    istringstream iss(input);
    iss >> commandId;

    getline(iss, argument);
    size_t start = argument.find_first_not_of(" \t");
    argument = (start == string::npos) ? "" : argument.substr(start);
}
