#pragma once
#include "OutputWriter.h"
#include <fstream>

/**
 * @class FileWriter
 * @brief Concrete OutputWriter implementation that writes to a file.
 *
 * This class handles writing strings line-by-line to a specified file.
 */
class FileWriter : public OutputWriter {
public:
    explicit FileWriter(const std::string& filePath);

    FileWriter(const FileWriter&) = delete;
    FileWriter& operator=(const FileWriter&) = delete;

    FileWriter(FileWriter&&) noexcept;
    FileWriter& operator=(FileWriter&&) noexcept;

    bool putLine(const std::string& line) override;
    ~FileWriter() override;

private:
    std::ofstream out;
};
