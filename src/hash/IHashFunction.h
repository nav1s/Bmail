#pragma once
#include <string>

class IHashFunction {
public:
    virtual ~IHashFunction() = default;

    /**
     * @brief Hashes a string and returns a size_t value.
     */
    virtual size_t hash(const std::string& input) const = 0;
};
