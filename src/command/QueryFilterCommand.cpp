#include "QueryFilterCommand.h"
#include <stdexcept>
#include "../StringValidator/UrlValidator.h"
#include <iostream>

using namespace std;

QueryFilterCommand::QueryFilterCommand(IFilter& filter, OutputWriter& writer)
    : filter(&filter), writer(&writer) {}

QueryFilterCommand::QueryFilterCommand(const QueryFilterCommand& other)
    : filter(other.filter), writer(other.writer) {}

QueryFilterCommand& QueryFilterCommand::operator=(const QueryFilterCommand& other) {
    if (this != &other) {
        filter = other.filter;
        writer = other.writer;
    }
    return *this;
}

QueryFilterCommand::QueryFilterCommand(QueryFilterCommand&& other) noexcept
    : filter(other.filter), writer(other.writer) {
    other.filter = nullptr;
}

QueryFilterCommand& QueryFilterCommand::operator=(QueryFilterCommand&& other) noexcept {
    if (this != &other) {
        filter = other.filter;
        writer = other.writer;
        other.filter = nullptr;
    }
    return *this;
}

QueryFilterCommand::~QueryFilterCommand() = default;

CommandResult QueryFilterCommand::execute(const string& arg) {
    UrlValidator validator;
    if (!validator.validate(arg)) {
        throw invalid_argument("QueryFilterCommand: missing URL argument");
    }

    bool contain = filter->possiblyContains(arg);
    bool result = filter->isBlacklisted(arg);

    writer->putLine("200 OK");
    writer->putLine("");  // Empty line for separation
    writer->putLine("");  // Empty line for separation

    if (contain) {
        writer->putLine("true " + string(result ? "true" : "false"));
    } else {
        writer->putLine("false");
    }

    // return CommandResult::OK_200;
}

