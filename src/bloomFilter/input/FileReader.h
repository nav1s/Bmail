#pragma once
#include "InputReader.h"
#include <fstream>
#include <string>

/**
 * @class FileReader
 * @brief Reads input from a file line-by-line.
 */
class FileReader : public InputReader {
public:
    /**
     * @brief Constructs a FileReader and opens the specified file.
     * @param filePath The path to the input file.
     */
    explicit FileReader(const std::string& filePath);

    /**
     * @brief Deleted copy constructor.
     */
    FileReader(const FileReader& other) = delete;

    /**
     * @brief Deleted copy assignment operator.
     */
    FileReader& operator=(const FileReader& other) = delete;

    /**
     * @brief Move constructor.
     */
    FileReader(FileReader&& other) noexcept;

    /**
     * @brief Move assignment operator.
     */
    FileReader& operator=(FileReader&& other) noexcept;

    /**
     * @brief Destructor that closes the input file stream.
     */
    ~FileReader();

    /**
     * @brief Reads the next line from the file.
     * @param line Output parameter to store the read line.
     * @return True if a line was successfully read; false on EOF or read failure.
     */
    bool getLine(std::string& line) override;

private:
    std::ifstream file;
};
