#include "UrlValidator.h"

using namespace std;

UrlValidator::UrlValidator()
    : url(
        R"(^((https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,})(\/\S*)?$)"
    ) {}

UrlValidator::UrlValidator(const UrlValidator& other)
    : url(other.url) {}

UrlValidator& UrlValidator::operator=(const UrlValidator& other) {
    if (this != &other) {
        const_cast<regex&>(url) = other.url;
    }
    return *this;
}

UrlValidator::UrlValidator(UrlValidator&& other) noexcept
    : url(std::move(other.url)) {}

UrlValidator& UrlValidator::operator=(UrlValidator&& other) noexcept {
    if (this != &other) {
        const_cast<regex&>(url) = std::move(other.url);
    }
    return *this;
}

UrlValidator::~UrlValidator() = default;

bool UrlValidator::validate(const string& input) const {
    return regex_match(input, url);
}
