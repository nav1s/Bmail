#include "DeleteFilterCommand.h"
#include "../validator/UrlValidator.h"
#include <stdexcept>

using namespace std;

DeleteFilterCommand::DeleteFilterCommand(IFilter& filter, OutputWriter& writer)
    : filter(&filter), writer(&writer) {}

DeleteFilterCommand::DeleteFilterCommand(const DeleteFilterCommand& other)
    : filter(other.filter), writer(other.writer) {}

DeleteFilterCommand& DeleteFilterCommand::operator=(const DeleteFilterCommand& other) {
    if (this != &other) {
        filter = other.filter;
        writer = other.writer;
    }
    return *this;
}

DeleteFilterCommand::DeleteFilterCommand(DeleteFilterCommand&& other) noexcept
    : filter(other.filter), writer(other.writer) {
    other.filter = nullptr;
}

DeleteFilterCommand& DeleteFilterCommand::operator=(DeleteFilterCommand&& other) noexcept {
    if (this != &other) {
        filter = other.filter;
        writer = other.writer;
        other.filter = nullptr;
    }
    return *this;
}

DeleteFilterCommand::~DeleteFilterCommand() = default;

CommandResult DeleteFilterCommand::execute(const string& arg) {
    // writer->putLine("DeleteFilterCommand::execute() called with arg: " + arg);
    UrlValidator validator;
    if (!validator.validate(arg)) {
        throw invalid_argument("DeleteFilterCommand: missing URL argument");
    }

    // Check if URL is actually blacklisted
    if (!filter->isBlacklisted(arg)) {
        throw runtime_error("DeleteFilterCommand: URL not found in blacklist");
    }

    // Remove the URL from the filter
    filter->remove(arg);
    return CommandResult::NO_CONTENT_204;
}
