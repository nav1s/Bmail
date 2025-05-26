#pragma once

#include "../command/AddFilterCommand.h"
#include "../command/DeleteFilterCommand.h"
#include "../command/ICommand.h"
#include "../command/QueryFilterCommand.h"
#include "../filter/IFilter.h"
#include "../hash/IHashFunction.h"
#include "../input/InputReader.h"
#include "../menu/IMenu.h"
#include "../menu/ConsoleMenu.h"
#include "../output/OutputWriter.h"

#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include <vector>
#include <stdexcept>

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
    void run(InputReader &reader, OutputWriter &writer, std::shared_ptr<IFilter> filter,
             std::shared_ptr<std::mutex> filterMutex);

  private:
    /**
     * @brief Registers available commands into the command map.
     */
    void registerCommands(OutputWriter &writer, std::shared_ptr<IFilter> filter, 
                          std::shared_ptr<std::mutex> filterMutex);

    /**
     * @brief Generates hash function instances based on integer signatures.
     * @param args A vector of integer identifiers for hash function configuration.
     * @param out The vector to store generated hash function instances.
     */
    void hashAssembler(std::vector<int> &args, std::vector<std::shared_ptr<IHashFunction>> &out);

    /**
     * @brief Map of integer command codes to command objects.
     */
    std::unordered_map<std::string, std::unique_ptr<ICommand>> commands;

    /**
     * @brief Pointer to a menu that interacts with the user
     */
    std::unique_ptr<IMenu> menu;
};
