// AddFilterCommand.cpp

#include "AddFilterCommand.h"
#include <iostream>

using namespace std;

AddFilterCommand::AddFilterCommand(shared_ptr<IFilter> filter, const string& url)
    : filter(move(filter)), url(url) {}

void AddFilterCommand::execute() {
    filter->addUrl(url);
}
