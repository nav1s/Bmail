#include "ConsoleMenu.h"
#include <iostream>

int ConsoleMenu::nextCommand() {
    std::cout << "1 - Add URL\n";
    std::cout << "2 - Query URL\n";
    std::cout << "Choose option: ";
    int choice;
    std::cin >> choice;
    return choice;
}

void ConsoleMenu::displayError(const std::string& error) {
    std::cerr << "Error: " << error << std::endl;
}
