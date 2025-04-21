#include "AddFilterCommand.h"
#include <iostream>

AddFilterCommand::AddFilterCommand(std::shared_ptr<IFilter> filter)
    : filter(filter) {}

void AddFilterCommand::execute() {
    std::string url;
    std::cin >> url;
    filter->add(url);
}
