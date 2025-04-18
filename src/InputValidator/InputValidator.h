#pragma once

#include <string>

/**
 * @class InputValidator
 * @brief Abstract base class for validating input strings.
 *
 * This interface allows for interchangeable text validation strategies.
 */
class InputValidator {
public:
    /**
     * @brief Checks if the input string is valid.
     * @param input The string to validate.
     * @return True if the input is valid, false otherwise.
     */
    virtual bool validate(const std::string& input) const = 0;

    /**
     * @brief Virtual destructor for safe polymorphic deletion.
     */
    virtual ~InputValidator() = default;
};
