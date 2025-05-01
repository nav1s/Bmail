#include "DeleteFilterCommand.h"
#include "../StringValidator/UrlValidator.h"
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

void DeleteFilterCommand::execute(const string& arg) {
    UrlValidator validator;
    if (!validator.validate(arg)) {
        writer->putLine("400 Bad Request");
        return;
    }

    // Check if URL is actually blacklisted
    if (!filter->isBlacklisted(arg)) {
        writer->putLine("404 Not Found");
        return;
    }

    // Remove the URL from the filter
    filter->remove(arg);
    writer->putLine("204 No Content");
}
