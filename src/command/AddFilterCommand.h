// ===== File: AddFilterCommand.h =====
// Command for adding a URL to the filter

#pragma once

#include "../command/ICommand.h"
#include "../filter/IFilter.h"
#include <memory>
#include <string>

using namespace std;

class AddFilterCommand : public ICommand {
private:
    shared_ptr<IFilter> filter;
    string url;
public:
    AddFilterCommand(shared_ptr<IFilter> filter, const string& url);
    void execute() override;
};
