#pragma once
#include <string>

/**
 * @class InputReader
 * @brief Abstract interface for input sources that provide line-based text input.
 *
 * Implementations of this class are responsible for retrieving input lines from different sources,
 * such as CLI, files, or cloud services.
 */
class InputReader {
public:
    /**
     * @brief Virtual destructor.
     */
    virtual ~InputReader() = default;

    /**
     * @brief Reads the next line of input.
     *
     * @param line Output parameter that will contain the input line if successful.
     * @return True if a line was successfully read; false if EOF or an error occurred.
     */
    virtual bool getLine(std::string& line) = 0;
};
