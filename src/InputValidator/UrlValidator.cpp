#pragma once

#include <string>
#include <regex>
#include "InputValidator.h"


class UrlValidator : public InputValidator {
    public:
        UrlValidator()
            : url(R"(^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})(\/\S*)?$)") {
            // Constructor body (optional)
        }
    
        bool validate(const std::string& input) const override {
            return regex_match(input, url);
        }
    
    private:
        const std::regex url;
    };
    
