#pragma once

#include "IMenu.h"
#include "../input/InputReader.h"
#include "../Output/OutputWriter.h"
#include "../filter/IFilter.h"
#include "../hash/IHashFunction.h"
#include "ICommand.h"

#include <memory>
#include <unordered_map>
#include <string>
#include <vector>

/**
 * @class App
 * @brief Core application class responsible for initializing and running the command-driven filter system.
 *
 * This class manages the configuration of the filtering system, including parsing user input,
 * constructing the filter and associated hash functions, and dispatching commands via a menu interface.
 */
class App {
public:
    /**
     * @brief Constructs the App object.
     */
    App();

    /**
     * @brief Runs the main application loop, including configuration and command execution.
     */
    void run(InputReader& reader, OutputWriter &writer);

private:
    /**
     * @brief Performs the configuration of the filter based on user input.
     * @param reader An input reader object used to obtain the initialization line.
     *
     * This function parses the initialization input line to extract filter parameters and
     * construct the appropriate filter and hash functions.
     */
    void semiConstructor(InputReader& reader, OutputWriter &writer);

    /**
     * @brief Registers available commands into the command map.
     */
    void registerCommands();

    /**
     * @brief Parses space-separated integers from a string into a vector.
     * @param input The raw input string.
     * @param args The output vector of parsed integers.
     */
    void parseInput(const std::string& input, std::vector<int>& args);

    /**
     * @brief Generates hash function instances based on integer signatures.
     * @param args A vector of integer identifiers for hash function configuration.
     * @param out The vector to store generated hash function instances.
     */
    void hashAssembler(std::vector<int>& args, std::vector<std::shared_ptr<IHashFunction>>& out);

    /**
     * @brief Map of integer command codes to command objects.
     */
    std::unordered_map<int, std::unique_ptr<ICommand>> commands;

    /**
     * @brief Pointer to the active filter used for command operations.
     */
    std::shared_ptr<IFilter> filter;

    /**
     * @brief Pointer to a menu that interacts with the user
     */
    std::unique_ptr<IMenu> menu;

};
