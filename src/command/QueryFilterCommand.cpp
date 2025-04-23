// ===== File: QueryFilterCommand.cpp =====
// Refactored for clarity and simplicity

#include "QueryFilterCommand.h"

using namespace std;

void QueryFilterCommand::execute() {
    std::string url;
    std::cin >> url;
    if (filter->isBlacklisted(url)) {
        std::cout << "URL might exist (possibly in filter).\n";
    } else {
        std::cout << "URL does not exist in filter.\n";
    }
    return *this; // Return reference to allow chaining
}

// Move Constructor: Transfers ownership from a temporary QueryFilterCommand.
QueryFilterCommand::QueryFilterCommand(QueryFilterCommand&& other) noexcept
    : filter(std::move(other.filter)),               // Move shared_ptr (no ref count increase)
      url(std::move(other.url))                     // Move URL string (cheap)
{}

// Move Assignment Operator: Transfers ownership during assignment from a temporary object.
QueryFilterCommand& QueryFilterCommand::operator=(QueryFilterCommand&& other) noexcept {
    if (this != &other) { // Prevent self-assignment
        filter = std::move(other.filter);                 // Move shared_ptr
        url = std::move(other.url);                       // Move string

    }
    return *this;
}

// Executes the filter query and prints result based on whether it's in the real blacklist or not.
bool QueryFilterCommand::execute() {
    // Query the filter to check if it thinks the URL is blacklisted
    filter->isBlacklisted(url);
}
