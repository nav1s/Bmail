// ===== File: AddFilterCommand.cpp =====
// Refactored for simplicity and clarity

#include "AddFilterCommand.h"
#include <iostream>
#include <string>

using namespace std;

AddFilterCommand::AddFilterCommand(shared_ptr<IFilter> filter, const string& url)
    // The constructor initializes the filter member by moving the passed-in shared pointer, and stores the URL string as is.
    : filter(move(filter)), url(url) {}

void AddFilterCommand::execute() {
    // Add URL to the filter
    filter->add(url);
}
