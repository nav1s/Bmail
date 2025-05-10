#pragma once

#include "IMenu.h"
#include "../input/InputReader.h"
#include "../output/OutputWriter.h"

/**
 * @class ConsoleMenu
 * @brief A menu implementation that interacts with the user via the console.
 */
class ConsoleMenu : public IMenu {
private:
    InputReader& reader;
    OutputWriter& writer;

public:
    /**
     * @brief Constructs a ConsoleMenu with the given input and output handlers.
     * @param reader The input reader to read user input.
     * @param writer The output writer to display output.
     */
    ConsoleMenu(InputReader& reader, OutputWriter& writer);

    /**
     * @brief Reads a command and argument from the user.
     * @param commandName Reference to a string where the command name will be stored.
     * @param argument Reference to a string where the argument will be stored.
     * @return True if input was read successfully, false otherwise.
     */
    bool getCommand(std::string& commandName, std::string& argument) const override;

    /**
     * @brief Displays a general message to the user.
     * @param message The message to display.
     */
    void displayMessage(const std::string& message) const override;

    /**
     * @brief Displays a message corresponding to a CommandResult.
     * converts the CommandResult enum to a string and displays it.
     * @param response The result of a command execution.
     */
    void displayResult(const CommandResult& response) const override;
};
