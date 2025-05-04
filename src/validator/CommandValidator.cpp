#include "CommandValidator.h"
#include <sstream>

using namespace std;

CommandValidator::CommandValidator() = default;

CommandValidator::~CommandValidator() = default;

CommandValidator::CommandValidator(const CommandValidator& other)
    : urlValidator(other.urlValidator) {}

CommandValidator& CommandValidator::operator=(const CommandValidator& other) {
    if (this != &other) {
        urlValidator = other.urlValidator;
    }
    return *this;
}

CommandValidator::CommandValidator(CommandValidator&& other) noexcept
    : urlValidator(move(other.urlValidator)) {}

CommandValidator& CommandValidator::operator=(CommandValidator&& other) noexcept {
    if (this != &other) {
        urlValidator = move(other.urlValidator);
    }
    return *this;
}

bool CommandValidator::validate(const string& input) const {
    istringstream iss(input);
    string command, url;

    // must have exactly two parts
    if (!(iss >> command >> url)) {
        return false; 
    }

    // extra tokens
    string extra;
    if (iss >> extra) return false;

    // checks for existing command implemintation and syntax
    if (!startsWithValidCommand(command)) {
        return false;
    }

    return urlValidator.validate(url);
}

bool CommandValidator::startsWithValidCommand(const string& cmd) const {
    return cmd == "GET" || cmd == "POST" || cmd == "DELETE";
}
