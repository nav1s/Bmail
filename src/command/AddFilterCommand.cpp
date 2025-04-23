// ===== File: AddFilterCommand.cpp =====
// Refactored for simplicity and clarity

#include "AddFilterCommand.h"
#include <string>

using namespace std;

void AddFilterCommand::execute() {
    std::string url;
    std::cin >> url;
    filter->add(url);
}
