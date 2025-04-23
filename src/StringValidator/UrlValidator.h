#pragma once

#include <string>
#include <regex>
#include "StringValidator.h"

/**
 * @class UrlValidator
 * @brief A concrete validator that checks if a string matches a valid URL pattern.
 *
 * This class implements the StringValidator interface to validate URLs using a regular expression.
 * It supports various URL formats including:
 * - URLs with or without protocol (http/https)
 * - URLs with or without www prefix
 * - URLs with or without path segments
 * - URLs with different TLDs (top-level domains)
 */
class UrlValidator : public StringValidator {
public:
    /**
     * @brief Constructs a UrlValidator with a predefined URL pattern.
     * 
     * The pattern validates URLs with the following characteristics:
     * - Optional http:// or https:// protocol
     * - Optional www. prefix
     * - Domain name with at least 2 characters
     * - Optional path segments
     */
    UrlValidator();

    /**
     * @brief Copy constructor.
     * @param other The UrlValidator to copy from.
     */
    UrlValidator(const UrlValidator& other);

    /**
     * @brief Copy assignment operator.
     * @param other The UrlValidator to copy from.
     * @return Reference to this UrlValidator.
     */
    UrlValidator& operator=(const UrlValidator& other);

    /**
     * @brief Move constructor.
     * @param other The UrlValidator to move from.
     */
    UrlValidator(UrlValidator&& other) noexcept;

    /**
     * @brief Move assignment operator.
     * @param other The UrlValidator to move from.
     * @return Reference to this UrlValidator.
     */
    UrlValidator& operator=(UrlValidator&& other) noexcept;

    /**
     * @brief Destructor.
     */
    ~UrlValidator();

    /**
     * @brief Validates if the input string matches a valid URL pattern.
     * @param input The string to validate.
     * @return True if the input matches a valid URL pattern, false otherwise.
     */
    bool validate(const std::string& input) const override;

private:
    /**
     * @brief Regular expression pattern for URL validation.
     * 
     * The pattern supports:
     * - Optional protocol (http:// or https://)
     * - Optional www. prefix
     * - Domain names with at least 2 characters
     * - Optional path segments
     * - Various TLD combinations
     */
    const std::regex url;
};
