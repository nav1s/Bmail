// ===== File: main.cpp =====
// Entry point: parses initial setup, creates filter/menu, registers commands, launches App

#include "app/App.h"
#include "StringValidator/UrlValidator.h"
#include "input/CliReader.h"
#include <iostream>
#include <sstream>
#include <memory>

using namespace std;

int main() {
    // Read initialization line from user input (format: <arraySize> <hashCount>)
    string initLine;
    getline(cin, initLine);
    // Use stringstream to extract initialization values from the input line
    istringstream iss(initLine);

    size_t arraySize;
    
    int hashCount;
    // Parse array size and number of hash functions
    iss >> arraySize >> hashCount;

    // Create hash functions
    // Create a vector of shared pointers to hash functions
    vector<shared_ptr<IHashFunction>> hashFunctions;
    // For each hash function index, create a StdHash with increasing repetition
    for (int i = 0; i < hashCount; ++i) {
        // Add a new StdHash function with i+1 repetitions
        hashFunctions.push_back(make_shared<StdHash>(i + 1));
    }

    // Create the filter and menu objects
    auto bloom_filter = make_shared<BloomFilter>(arraySize, hashFunctions);
    auto console_menu = make_shared<ConsoleMenu>();

    // Create the filter and menu objects
    // Create a URL validator to be used for validation
    auto url_validator = make_shared<UrlValidator>();

    // Create input reader (using CliReader)
    auto input_reader = make_shared<CliReader>();

    // Launch the app
    App app(bloom_filter, console_menu, input_reader, url_validator);

    app.registerCommand(1, [bloom_filter](const string& url) {
        AddFilterCommand(bloom_filter, url).execute();
    });
    
    app.registerCommand(2, [bloom_filter](const string& url) {
        QueryFilterCommand(bloom_filter, url).execute();
    });
    app.run();

    return 0;
}
