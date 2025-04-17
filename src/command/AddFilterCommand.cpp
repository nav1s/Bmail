#include "AddFilterCommand.h"
#include <iostream>

AddFilterCommand::AddFilterCommand(std::shared_ptr<IFilter> filter)
    : filter(filter) {}

void AddFilterCommand::execute() {
    std::cout << "Enter URL to add: ";
    std::string url;
    std::cin >> url;
    if (filter->addUrl(url)) {
        std::cout << "URL added successfully.\n";
    } else {
        std::cout << "URL was already present.\n";
    }
}
