// ===== File: AddFilterCommand.cpp =====
// Refactored for simplicity and clarity

#include "AddFilterCommand.h"
#include <iostream>
#include <string>

using namespace std;

AddFilterCommand::AddFilterCommand(shared_ptr<IFilter> filter, const string& url)
    // The constructor initializes the filter member by moving the passed-in shared pointer, and stores the URL string as is.
    : filter(move(filter)), url(url) {}

// Destructor: Default implementation is sufficient as we rely on smart pointers for resource management.
AddFilterCommand::~AddFilterCommand() = default;

// Copy Constructor: Creates a deep copy of another AddFilterCommand.
AddFilterCommand::AddFilterCommand(const AddFilterCommand& other)
    : filter(other.filter), // Copy shared_ptr (increases ref count).
      url(other.url)        // Copy URL string.
{}

// Copy Assignment Operator: Handles assignment from another AddFilterCommand.
AddFilterCommand& AddFilterCommand::operator=(const AddFilterCommand& other) {
    if (this != &other) { // Prevent self-assignment.
        filter = other.filter; // Copy shared_ptr.
        url = other.url;       // Copy URL string.
    }
    return *this; // Return reference to allow chaining.
}

// Move Constructor: Transfers ownership from a temporary AddFilterCommand.
AddFilterCommand::AddFilterCommand(AddFilterCommand&& other) noexcept
    : filter(move(other.filter)), // Move shared_ptr.
      url(move(other.url))        // Move URL string.
{}

// Move Assignment Operator: Transfers ownership during assignment from a temporary object.
AddFilterCommand& AddFilterCommand::operator=(AddFilterCommand&& other) noexcept {
    if (this != &other) { // Prevent self-assignment.
        filter = move(other.filter); // Move shared_ptr.
        url = move(other.url);       // Move URL string.
    }
    return *this;
}
bool AddFilterCommand::execute() {
    // add a URL to the blacklist, using Ifilter->add(url) 
    filter->add(url);
}
