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

void QueryFilterCommand::execute(const string& arg) {
    UrlValidator validator;
    if (!validator.validate(arg)) {
        writer->putLine("400 Bad Request");
        return;
    }

    bool contain = filter->possiblyContains(arg);
    bool result = filter->isBlacklisted(arg);
    // print to the client
    writer->putLine(contain ? "200 Ok" : "404 Not Found");
    writer->putLine("\n");
    writer->putLine(contain? "true " + string(result ? "true" : "false"): "false");
}
