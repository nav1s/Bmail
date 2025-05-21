#include "AddFilterCommand.h"
#include <stdexcept>
#include "../validator/UrlValidator.h"

using namespace std;

AddFilterCommand::AddFilterCommand(IFilter& filter, OutputWriter& writer)
    : filter(&filter), writer(&writer) {}

AddFilterCommand::AddFilterCommand(const AddFilterCommand& other)
    : filter(other.filter), writer(other.writer) {}

AddFilterCommand& AddFilterCommand::operator=(const AddFilterCommand& other) {
    if (this != &other) {
        filter = other.filter;
        writer = other.writer;
    }
    return *this;
}

AddFilterCommand::AddFilterCommand(AddFilterCommand&& other) noexcept
    : filter(other.filter), writer(other.writer) {
    other.filter = nullptr;
    other.writer = nullptr;
}

AddFilterCommand& AddFilterCommand::operator=(AddFilterCommand&& other) noexcept {
    if (this != &other) {
        filter = other.filter;
        writer = other.writer;
        other.filter = nullptr;
        other.writer = nullptr;
    }
    return *this;
}

AddFilterCommand::~AddFilterCommand() = default;

CommandResult AddFilterCommand::execute(const string& arg) {
    // writer->putLine("AddFilterCommand::execute() called with arg: " + arg);
    UrlValidator validator;
    if (!validator.validate(arg)) {
        throw invalid_argument("AddFilterCommand: missing URL argument");
    }

    filter->add(arg);
    return CommandResult::CREATED_201;
}
