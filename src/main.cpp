// ===== File: main.cpp =====
// Entry point: parses initial setup, creates filter/menu, registers commands, launches App

#include "app/App.h"
#include <iostream>
#include <sstream>
#include <memory>
#include <set>

using namespace std;

int main() {
    // Read initialization line from user input (format: <arraySize> <hashCount>)
    string initLine; // stores the full input line, e.g., "1000 3"
    getline(cin, initLine);

    // Use stringstream to extract initialization values from the input line
    istringstream iss(initLine);

    size_t arraySize; // number of bits in the Bloom filter
    int hashCount;    // number of different hash functions to use

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
    // Create BloomFilter with specified size and the hash functions vector
    auto bloom_filter = make_shared<BloomFilter>(arraySize, hashCount);
    // Create menu for user interaction (reads from stdin silently)
    auto console_menu = make_shared<ConsoleMenu>();

    // Launch the app and Create the App and run manually to handle commands with registration
    App app(bloom_filter, console_menu);
    app.run();
    return 0;
}
