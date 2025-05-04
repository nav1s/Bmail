#pragma once

#include "IMenu.h"
#include "../input/InputReader.h"
#include "../Output/OutputWriter.h"
#include <string>

/**
 * @class ConsoleMenu
 * @brief A concrete implementation of IMenu that interacts with the user via an InputReader.
 *
 * This class uses an external InputReader instance to read commands from the user,
 * and displays a basic text-based menu to the console.
 */
class ConsoleMenu : public IMenu {
public:
    /**
     * @brief Constructs a ConsoleMenu with a reference to an InputReader.
     * @param reader An InputReader instance used to collect input from the user.
     * @param writer
     */
    explicit ConsoleMenu(InputReader& reader, OutputWriter& writer);

    /**
     * @brief Deleted copy constructor.
     */
    ConsoleMenu(const ConsoleMenu&) = delete;

    /**
     * @brief Deleted copy assignment operator.
     */
    ConsoleMenu& operator=(const ConsoleMenu&) = delete;

    /**
     * @brief Default move constructor.
     */
    ConsoleMenu(ConsoleMenu&&) noexcept = default;

    /**
     * @brief Default move assignment operator.
     */
    ConsoleMenu& operator=(ConsoleMenu&&) noexcept = default;

    /**
     * @brief Virtual destructor.
     */
    ~ConsoleMenu() override = default;

    /**
     * @brief Prompts the user and retrieves their selected command and argument.
     * 
     * @param commandName Output parameter for the command name.
     * @param argument Output parameter for the remainder of the input (e.g. a URL).
     */
    bool getCommand(std::string& commandName, std::string& argument) const override;

private:
    InputReader& reader;
    OutputWriter& writer;
};
