// ===== File: QueryFilterCommand.cpp =====
// Refactored for clarity and simplicity

#include "QueryFilterCommand.h"
#include <iostream>

using namespace std;

// Constructor: Initializes the QueryFilterCommand with a given filter, URL, and reference blacklist.
QueryFilterCommand::QueryFilterCommand(shared_ptr<IFilter> filter, const string& url)
    // This constructor stores the URL and ground truth set. It also moves ownership of the filter shared pointer.
    : filter(move(filter)), url(url) {}

// Destructor: Default implementation is sufficient as we rely on smart pointers for resource management.
QueryFilterCommand::~QueryFilterCommand() = default;

// Copy Constructor: Creates a deep copy of another QueryFilterCommand.
QueryFilterCommand::QueryFilterCommand(const QueryFilterCommand& other)
    : filter(other.filter),         // Copy shared_ptr (increases ref count).
      url(other.url)               // Copy URL string.
{}

// Copy Assignment Operator: Handles assignment from another QueryFilterCommand.
QueryFilterCommand& QueryFilterCommand::operator=(const QueryFilterCommand& other) {
    if (this != &other) { // Prevent self-assignment
        filter = other.filter;                 // Copy shared_ptr (increase ref count)
        url = other.url;                       // Copy URL string
    }
    return *this; // Return reference to allow chaining
}

// Move Constructor: Transfers ownership from a temporary QueryFilterCommand.
QueryFilterCommand::QueryFilterCommand(QueryFilterCommand&& other) noexcept
    : filter(move(other.filter)),               // Move shared_ptr (no ref count increase)
      url(move(other.url))                     // Move URL string (cheap)
{}

// Move Assignment Operator: Transfers ownership during assignment from a temporary object.
QueryFilterCommand& QueryFilterCommand::operator=(QueryFilterCommand&& other) noexcept {
    if (this != &other) { // Prevent self-assignment
        filter = move(other.filter);                 // Move shared_ptr
        url = move(other.url);                       // Move string

    }
    return *this;
}

// Executes the filter query and prints result based on whether it's in the real blacklist or not.
bool QueryFilterCommand::execute() {
    // Query the filter to check if it thinks the URL is blacklisted
    filter->isBlacklisted(url);
}
