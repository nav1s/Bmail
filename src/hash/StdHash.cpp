#include "StdHash.h"
#include <functional>
#include <stdexcept>
#include <string>

StdHash::StdHash(int reps) : reps(reps) {
    if (reps < 1) {
        throw std::invalid_argument("Hash repetition count must be >= 1");
    }
}

size_t StdHash::hash(const std::string& input) const {
    //first rep since we dont want to touch input and it needs conversion
    size_t result = std::hash<std::string>{}(input);
    for (int i = 1; i < reps; ++i) {
        // hashing while converting between int and string
        result = std::hash<std::string>{}(std::to_string(result));
    }
    return result;
}
