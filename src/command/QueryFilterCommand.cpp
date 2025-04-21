#include "QueryFilterCommand.h"
#include <iostream>

QueryFilterCommand::QueryFilterCommand(std::shared_ptr<IFilter> filter)
    : filter(filter) {}

void QueryFilterCommand::execute() {
    std::string url;
    std::cin >> url;
    if (filter->isBlacklisted(url)) {
        std::cout << "URL might exist (possibly in filter).\n";
    } else {
        std::cout << "URL does not exist in filter.\n";
    }
}
