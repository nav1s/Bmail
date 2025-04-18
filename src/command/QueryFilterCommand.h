// ===== File: QueryFilterCommand.h =====
// Command for querying a URL in the filter and comparing with true blacklist

#pragma once

#include "../command/ICommand.h"
#include "../filter/IFilter.h"
#include <memory>
#include <string>
#include <set>

using namespace std;

class QueryFilterCommand : public ICommand {
private:
    shared_ptr<IFilter> filter;
    string url;
    set<string> realBlacklist;

public:
    QueryFilterCommand(shared_ptr<IFilter> filter);
    void execute() override;
};
