// ===== File: ConsoleMenu.cpp =====
// Implementation of IMenu that reads input silently from std::cin without printing

#include "ConsoleMenu.h"
#include <iostream>
#include <string>

using namespace std;

// Reads a full line of input from std::cin and returns it
string ConsoleMenu::nextCommand() {
    string line;
    getline(cin, line); // Read full input line silently
    return line;
}

// only prints error in case of incorrect input
void ConsoleMenu::displayError(const string& error) {
    cerr << "Error: " << error << endl;
}
