#pragma once

#include <string>
#include "UrlValidator.h"

/**
 * @class FilterCommandValidator
 * @brief Validates commands with correct syntax and valid URLs.
 *
 * Accepts only commands in the format:
 * - GET <url>
 * - POST <url>
 * - DELETE <url>
 * 
 * Command is case-sensitive. URL is validated using UrlValidator.
 */
class FilterCommandValidator : public IValidator {
public:
    FilterCommandValidator();
    ~FilterCommandValidator();

    FilterCommandValidator(const FilterCommandValidator& other);
    FilterCommandValidator& operator=(const FilterCommandValidator& other);

    FilterCommandValidator(FilterCommandValidator&& other) noexcept;
    FilterCommandValidator& operator=(FilterCommandValidator&& other) noexcept;

    /**
     * @brief Validates a command line.
     * @param input The full input line
     * @return True if command and URL are valid, false otherwise.
     */
    bool validate(const std::string& input) const override;

private:
    UrlValidator urlValidator;

    bool startsWithValidCommand(const std::string& cmd) const;
};