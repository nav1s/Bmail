#include "FileReader.h"
using namespace std;

FileReader::FileReader(const string& filePath)
    : file(filePath) {}

FileReader::FileReader(FileReader&& other) noexcept
    : file(std::move(other.file)) {}

FileReader& FileReader::operator=(FileReader&& other) noexcept {
    if (this != &other) {
        file = move(other.file);
    }
    return *this;
}

FileReader::~FileReader() {
    if (file.is_open()) {
        file.close();
    }
}

bool FileReader::getLine(string& line) {
    return static_cast<bool>(getline(file, line));
}
