#pragma once

#include "../menu/IMenu.h"

class ConsoleMenu : public IMenu {
public:
    int nextCommand() override;
    void displayError(const std::string& error) override;
};
