#include "FilterCommandValidator.h"
#include <sstream>

using namespace std;

FilterCommandValidator::FilterCommandValidator() = default;

FilterCommandValidator::~FilterCommandValidator() = default;

FilterCommandValidator::FilterCommandValidator(const FilterCommandValidator& other)
    : urlValidator(other.urlValidator) {}

FilterCommandValidator& FilterCommandValidator::operator=(const FilterCommandValidator& other) {
    if (this != &other) {
        urlValidator = other.urlValidator;
    }
    return *this;
}

FilterCommandValidator::FilterCommandValidator(FilterCommandValidator&& other) noexcept
    : urlValidator(move(other.urlValidator)) {}

FilterCommandValidator& FilterCommandValidator::operator=(FilterCommandValidator&& other) noexcept {
    if (this != &other) {
        urlValidator = move(other.urlValidator);
    }
    return *this;
}

bool FilterCommandValidator::validate(const string& input) const {
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

bool FilterCommandValidator::startsWithValidCommand(const string& cmd) const {
    return cmd == "GET" || cmd == "POST" || cmd == "DELETE";
}