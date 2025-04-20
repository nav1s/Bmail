// ===== File: AddFilterCommand.h =====
// Command for adding a URL to the filter

#pragma once

#include "../command/ICommand.h"
#include "../filter/IFilter.h"
#include <memory>
#include <string>

// AddFilterCommand is responsible for adding a given URL into the filter.
// It stores a reference to the filter and the specific URL to operate on.
class AddFilterCommand : public ICommand {
private:
    // Shared pointer to the IFilter object that will be modified
    shared_ptr<IFilter> filter;

    // The URL that will be added to the filter
    string url;
public:
    /**
    * @brief Constructs an AddFilterCommand object.
    * @param filter A shared pointer (high-level abstraction, Manages the lifetime of dynamically allocated memory.)
    *  to an IFilter implementation used to store the URL.
    * @param url The URL to be added to the filter.
    *
    * The constructor initializes the filter member by moving the passed-in shared pointer,
    * and stores the URL string as is.
    */
    AddFilterCommand(shared_ptr<IFilter> filter, const string& url);

    /*
    * @brief Executes the query operation.
    */
    void execute() override;
};
