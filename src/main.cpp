// ===== File: main.cpp =====
// Entry point: parses initial setup, creates filter/menu, registers commands, launches App

#include "app/App.h"
//#include "ConsoleMenu.h"
//#include "BloomFilter.h"
//#include "AddFilterCommand.h"
//#include "QueryFilterCommand.h"
#include <iostream>
#include <sstream>
#include <memory>
#include <set>

using namespace std;

int main() {
    // Read initial configuration line: array size and number of hash functions
    string initLine;
    getline(cin, initLine);
    istringstream iss(initLine);

    size_t arraySize;
    int hashCount;
    iss >> arraySize >> hashCount;

    // Create the filter and menu objects
    auto bloom_filter = make_shared<BloomFilter>(arraySize, hashCount);
    auto console_menu = make_shared<ConsoleMenu>();

    // Create the App and run manually to handle commands with registration
    App app(bloom_filter, console_menu);
    app.run();
    return 0;
}
