#pragma once
#include <string>

/**
 * @interface OutputWriter
 * @brief Interface for writing lines of text to an output destination.
 *
 * This abstract class provides a unified interface for writing output to
 * files, streams, network sockets, or other data sinks.
 */
class OutputWriter {
public:
    /**
     * @brief Writes a single line to the output.
     * @param line The string to be written (without newline).
     * @return True if writing succeeded, false otherwise.
     */
    virtual bool writeLine(const std::string& line) = 0;

    /**
     * @brief Virtual destructor.
     */
    virtual ~OutputWriter() = default;
};
