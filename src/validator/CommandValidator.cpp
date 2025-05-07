#include "CommandValidator.h"
#include <sstream>
#include <unordered_set>
#include <memory>
#include "IValidator.h"



using namespace std;

CommandValidator::CommandValidator(
    shared_ptr<IValidator> urlValidator,
    unordered_set<string> validCommands
)
    : urlValidator(std::move(urlValidator)),
      validCommands(std::move(validCommands)) {}

CommandValidator::~CommandValidator() = default;

CommandValidator::CommandValidator(const CommandValidator& other)
    : urlValidator(other.urlValidator),
      validCommands(other.validCommands) {}

CommandValidator& CommandValidator::operator=(const CommandValidator& other) {
    if (this != &other) {
        urlValidator = other.urlValidator;
        validCommands = other.validCommands;
    }
    return *this;
}

CommandValidator::CommandValidator(CommandValidator&& other) noexcept
    : urlValidator(std::move(other.urlValidator)),
      validCommands(std::move(other.validCommands)) {}

CommandValidator& CommandValidator::operator=(CommandValidator&& other) noexcept {
    if (this != &other) {
        urlValidator = std::move(other.urlValidator);
        validCommands = std::move(other.validCommands);
    }
    return *this;
}

bool CommandValidator::validate(const string& input) const {
    istringstream iss(input);
    string command, url;

    if (!(iss >> command >> url)) return false;

    string extra;
    if (iss >> extra) return false;

    if (!startsWithValidCommand(command)) return false;

    return urlValidator->validate(url);
}

bool CommandValidator::startsWithValidCommand(const string& cmd) const {
    return validCommands.find(cmd) != validCommands.end();
}
