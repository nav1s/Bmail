#pragma once

#include <string>
#include "InputValidator.h"
#include <regex>

using namespace std;

/**
 * @class UrlValidator
 * @brief Concrete validator for checking if a string is a valid URL.
 */
class UrlValidator : public InputValidator {
public:
    UrlValidator(); // Constructor
    /**
     * @brief Validates if the input is a well-formed URL using a URL regex.
     * @param input The string to validate.
     * @return True if it appears to be a valid URL, false otherwise.
     */
    bool validate(const string& input) const override;
    private:
        const regex url;
};
