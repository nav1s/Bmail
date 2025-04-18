#pragma once
#include "InputReader.h"
#include <iostream>
#include <string>

/**
 * @class CliReader
 * @brief Reads input from standard input (CLI).
 */
class CliReader : public InputReader {
public:
    /**
     * @brief Default constructor.
     */
    CliReader();

    /**
     * @brief Copy constructor.
     */
    CliReader(const CliReader& other);

    /**
     * @brief Copy assignment operator.
     */
    CliReader& operator=(const CliReader& other);

    /**
     * @brief Move constructor.
     */
    CliReader(CliReader&& other) noexcept;

    /**
     * @brief Move assignment operator.
     */
    CliReader& operator=(CliReader&& other) noexcept;

    /**
     * @brief Destructor.
     */
    ~CliReader();

    /**
     * @brief Reads a line from standard input.
     * @param line Output parameter to store the read line.
     * @return True if a line was successfully read; false if EOF or input error occurred.
     */
    bool getLine(std::string& line) override;
};
