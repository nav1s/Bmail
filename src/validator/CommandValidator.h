#pragma once

#include <string>
#include "UrlValidator.h"

/**
 * @class CommandValidator
 * @brief Validates commands with correct syntax and valid URLs.
 *
 * Accepts only commands in the format:
 * - GET <url>
 * - POST <url>
 * - DELETE <url>
 * 
 * Command is case-sensitive. URL is validated using UrlValidator.
 */
class CommandValidator : public IValidator {
public:
    CommandValidator();
    ~CommandValidator();

    CommandValidator(const CommandValidator& other);
    CommandValidator& operator=(const CommandValidator& other);

    CommandValidator(CommandValidator&& other) noexcept;
    CommandValidator& operator=(CommandValidator&& other) noexcept;

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
