#pragma once

#include <string>
#include <regex>
#include "StringValidator.h"

/**
 * @class UrlValidator
 * @brief Concrete validator for checking if a string is a valid URL.
 */
class UrlValidator : public StringValidator {
public:
    /**
     * @brief Default constructor.
     */
    UrlValidator();

    /**
     * @brief Copy constructor.
     */
    UrlValidator(const UrlValidator& other);

    /**
     * @brief Copy assignment operator.
     */
    UrlValidator& operator=(const UrlValidator& other);

    /**
     * @brief Move constructor.
     */
    UrlValidator(UrlValidator&& other) noexcept;

    /**
     * @brief Move assignment operator.
     */
    UrlValidator& operator=(UrlValidator&& other) noexcept;

    /**
     * @brief Destructor.
     */
    ~UrlValidator();

    /**
     * @brief Validates if the input is a well-formed URL using a URL regex.
     * @param input The string to validate.
     * @return True if it appears to be a valid URL, false otherwise.
     */
    bool validate(const std::string& input) const override;

private:
    const std::regex url;
};
