#pragma once
#include "OutputWriter.h"

/**
 * @class CLIPrinter
 * @brief Concrete OutputWriter implementation that writes to the console.
 *
 * This class handles writing lines of text to standard output.
 */
class CLIPrinter : public OutputWriter {
public:
    CLIPrinter() = default;

    CLIPrinter(const CLIPrinter&) = delete;
    CLIPrinter& operator=(const CLIPrinter&) = delete;

    CLIPrinter(CLIPrinter&&) noexcept = default;
    CLIPrinter& operator=(CLIPrinter&&) noexcept = default;

    /**
     * @brief Writes a single line to the console (std::cout).
     * @param line The string to be written.
     * @return Always true (std::cout doesn't typically fail in this context).
     */
    bool putLine(const std::string& line) override;

    /**
     * @brief Destructor.
     */
    ~CLIPrinter() override = default;
};
