#include "ConsoleMenu.h"
#include <iostream>
#include <sstream>
#include <stdexcept>
#include "../output/OutputWriter.h"
#include "../input/InputReader.h"
#include "../command/CommandResult.h"
#include <unordered_map>
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

void ConsoleMenu::displayMessage(const string& message) const {
    writer.putLine(message);
}

void ConsoleMenu::displayResult(const CommandResult& response) const {
    static const unordered_map<CommandResult, string> resultMessages = {
        {CommandResult::CREATED_201, "201 Created"},
        {CommandResult::NO_CONTENT_204, "204 No Content"},
        {CommandResult::OK_200, "200 OK"},
        {CommandResult::NOT_FOUND_404, "404 Not Found"},
        {CommandResult::BAD_REQUEST_400, "400 Bad Request"}
    };

    auto it = resultMessages.find(response);
    if (it != resultMessages.end()) {
        writer.putLine(it->second);
    } else {
        writer.putLine("400 Bad Request");
    }
}
