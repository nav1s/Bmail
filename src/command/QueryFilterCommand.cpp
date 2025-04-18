// QueryFilterCommand.cpp

#include "QueryFilterCommand.h"
#include <iostream>

using namespace std;

QueryFilterCommand::QueryFilterCommand(shared_ptr<IFilter> filter, const string& url, const set<string>& trueBlacklist)
    : filter(move(filter)), url(url), realBlacklist(trueBlacklist) {}

void QueryFilterCommand::execute() {
    bool inFilter = filter->queryUrl(url);
    if (!inFilter) {
        cout << "false" << endl;
    } else {
        bool inTrueSet = realBlacklist.count(url) > 0;
        cout << "true " << (inTrueSet ? "true" : "false") << endl;
    }
}
