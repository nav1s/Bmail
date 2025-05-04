#include "CliReader.h"
#include <iostream>

using namespace std;

CliReader::CliReader() = default;

CliReader::CliReader(const CliReader& other) = default;

CliReader& CliReader::operator=(const CliReader& other) = default;

CliReader::CliReader(CliReader&& other) noexcept = default;

CliReader& CliReader::operator=(CliReader&& other) noexcept = default;

CliReader::~CliReader() = default;

bool CliReader::getLine(string& line) {
    return static_cast<bool>(getline(cin, line));
}
