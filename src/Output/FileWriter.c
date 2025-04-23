#include "FileWriter.h"
#include <stdexcept>

using namespace std;

FileWriter::FileWriter(const string& filePath)
    : out(filePath) {
    if (!out) {
        throw runtime_error("FileWriter: Failed to open file for writing: " + filePath);
    }
}

FileWriter::FileWriter(FileWriter&& other) noexcept
    : out(std::move(other.out)) {}

FileWriter& FileWriter::operator=(FileWriter&& other) noexcept {
    if (this != &other) {
        out = std::move(other.out);
    }
    return *this;
}

bool FileWriter::writeLine(const string& line) {
    if (!out) return false;
    out << line << '\n';
    return true;
}

FileWriter::~FileWriter() {
    if (out.is_open()) {
        out.close();
    }
}
