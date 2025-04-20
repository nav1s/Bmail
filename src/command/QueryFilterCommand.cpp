// ===== File: QueryFilterCommand.cpp =====
// Refactored for clarity and simplicity

#include "QueryFilterCommand.h"
#include <iostream>

using namespace std;

QueryFilterCommand::QueryFilterCommand(shared_ptr<IFilter> filter, const string& url, const set<string>& trueBlacklist)
    // This constructor stores the URL and ground truth set. It also moves ownership of the filter shared pointer.
    : filter(move(filter)), url(url), realBlacklist(trueBlacklist) {}

/**
 * This function first checks whether the URL is reported as blacklisted by the filter. If not,
 * prints "false". If the filter claims it's blacklisted, it checks the trueBlacklist
 * and prints whether the detection was a true positive ("true true") or false positive ("true false").
 */
void QueryFilterCommand::execute() {
    // Check if item appears in filter
    bool inFilter = filter->isBlacklisted(url);
    if (!inFilter) {
        cout << "false" << endl;
    } else {
        // Compare with actual blacklist
        bool inTrueSet = realBlacklist.count(url) > 0;
        cout << "true " << (inTrueSet ? "true" : "false") << endl;
    }
}
