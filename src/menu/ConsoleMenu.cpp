#include "ConsoleMenu.h"
#include <iostream>
#include <sstream>
#include <stdexcept>
#include "../Output/OutputWriter.h"
#include "../input/InputReader.h"
#include <string>
using namespace std;

ConsoleMenu::ConsoleMenu(InputReader& reader, OutputWriter& writer)
    : reader(reader), writer(writer) {}

void ConsoleMenu::getCommand(string& commandName, std::string& argument) const {
    // cout << "ConsoleMenu::getCommand" << endl;
    string input;
    if (!reader.getLine(input)) {
        throw runtime_error("Failed to read command input.");
    }

    istringstream iss(input);
    if (!(iss >> commandName)) {
        cout << "400 Bad Request" << endl;
        return;
    }

    getline(iss, argument);
    size_t start = argument.find_first_not_of(" \t");
    argument = (start == string::npos) ? "" : argument.substr(start);
}
