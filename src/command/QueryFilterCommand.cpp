// ===== File: QueryFilterCommand.cpp =====
// Refactored for clarity and simplicity

#include "QueryFilterCommand.h"
#include <iostream>

using namespace std;

// Constructor: Initializes the QueryFilterCommand with a given filter, URL, and reference blacklist.
QueryFilterCommand::QueryFilterCommand(shared_ptr<IFilter> filter, const string& url, const set<string>& trueBlacklist)
    // This constructor stores the URL and ground truth set. It also moves ownership of the filter shared pointer.
    : filter(move(filter)), url(url), realBlacklist(trueBlacklist) {}

// Destructor: Default implementation is sufficient as we rely on smart pointers for resource management.
QueryFilterCommand::~QueryFilterCommand() = default;

// Copy Constructor: Creates a deep copy of another QueryFilterCommand.
QueryFilterCommand::QueryFilterCommand(const QueryFilterCommand& other)
    : filter(other.filter),         // Copy shared_ptr (increases ref count).
      url(other.url),               // Copy URL string.
      realBlacklist(other.realBlacklist) // Copy the set of truly blacklisted URLs.
{}

// Copy Assignment Operator: Handles assignment from another QueryFilterCommand.
QueryFilterCommand& QueryFilterCommand::operator=(const QueryFilterCommand& other) {
    if (this != &other) { // Prevent self-assignment
        filter = other.filter;                 // Copy shared_ptr (increase ref count)
        url = other.url;                       // Copy URL string
        realBlacklist = other.realBlacklist;   // Copy set
    }
    return *this; // Return reference to allow chaining
}

// Move Constructor: Transfers ownership from a temporary QueryFilterCommand.
QueryFilterCommand::QueryFilterCommand(QueryFilterCommand&& other) noexcept
    : filter(move(other.filter)),               // Move shared_ptr (no ref count increase)
      url(move(other.url)),                     // Move URL string (cheap)
      realBlacklist(move(other.realBlacklist))  // Move the set (avoids deep copy)
{}

// Move Assignment Operator: Transfers ownership during assignment from a temporary object.
QueryFilterCommand& QueryFilterCommand::operator=(QueryFilterCommand&& other) noexcept {
    if (this != &other) { // Prevent self-assignment
        filter = move(other.filter);                 // Move shared_ptr
        url = move(other.url);                       // Move string
        realBlacklist = move(other.realBlacklist);   // Move set
    }
    return *this;
}

// Executes the filter query and prints result based on whether it's in the real blacklist or not.
void QueryFilterCommand::execute() {
    // Query the filter to check if it thinks the URL is blacklisted
    bool inFilter = filter->isBlacklisted(url);

    if (!inFilter) {
        // Filter does not consider it blacklisted -> simply print false
        cout << "false" << endl;
    } else {
        // Filter thinks the URL is blacklisted
        // Let's verify it against the real blacklist
        bool inTrueSet = realBlacklist.count(url) > 0;

        // If it's truly blacklisted -> "true true"
        // Otherwise, it's a false positive -> "true false"
        cout << "true " << (inTrueSet ? "true" : "false") << endl;
    }
}
