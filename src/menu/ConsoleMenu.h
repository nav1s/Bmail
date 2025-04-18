// ===== File: ConsoleMenu.h =====
// Interface implementation for getting user input silently

#pragma once

#include "../menu/IMenu.h"
#include <string>

using namespace std;

class ConsoleMenu : public IMenu {
public:
    string nextCommand() override;
    void displayError(const string& error) override;
};
