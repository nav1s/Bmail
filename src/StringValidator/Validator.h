#pragma once

#include <vector>

/**
 * @class Validator
 * @brief Utility class for validating integer-based inputs.
 *
 * This class provides static utility methods to validate data such as filter initialization
 * parameters. No instantiation is required.
 */
class Validator {
public:
    /**
     * @brief Validates that all integers in the vector are strictly positive.
     * @param args Vector of integers to validate.
     * @return true if all values are positive, false otherwise.
     */
    static bool validatePositiveIntegers(const std::vector<int>& args);
};
