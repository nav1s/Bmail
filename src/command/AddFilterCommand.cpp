#include "AddFilterCommand.h"
#include <stdexcept>
#include "../StringValidator/UrlValidator.h"

using namespace std;

AddFilterCommand::AddFilterCommand(IFilter& filter) : filter(&filter) {}

AddFilterCommand::AddFilterCommand(const AddFilterCommand& other) : filter(other.filter) {}

AddFilterCommand& AddFilterCommand::operator=(const AddFilterCommand& other) {
    if (this != &other) {
        filter = other.filter;
    }
    return *this;
}

AddFilterCommand::AddFilterCommand(AddFilterCommand&& other) noexcept : filter(other.filter) {
    other.filter = nullptr;
}

AddFilterCommand& AddFilterCommand::operator=(AddFilterCommand&& other) noexcept {
    if (this != &other) {
        filter = other.filter;
        other.filter = nullptr;
    }
    return *this;
}

AddFilterCommand::~AddFilterCommand() = default;

void AddFilterCommand::execute(const string& arg) {
    UrlValidator validator;
    if (!validator.validate(arg)) {
        throw invalid_argument("AddFilterCommand: missing URL argument");
    }
    filter->add(arg);
}
