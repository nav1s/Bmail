#include "QueryFilterCommand.h"
#include <stdexcept>
#include "../StringValidator/UrlValidator.h"

using namespace std;

QueryFilterCommand::QueryFilterCommand(IFilter& filter, OutputWriter& writer)
    : filter(&filter), writer(writer) {}

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
        throw invalid_argument("QueryFilterCommand: missing or invalid URL argument");
    }

    bool contain = filter->possiblyContains(arg);
    bool result = filter->isBlacklisted(arg);
    writer.putLine(string(contain ? "true" : "false") + string(result ? "true" : "false"));
}
