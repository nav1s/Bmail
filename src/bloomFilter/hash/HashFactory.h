#pragma once
#include "IHashFunction.h"
#include <memory>
#include <string>

/**
 * @class HashFactory
 * @brief Hardcoded static-only factory for known hash types.
 *
 * Supports signature-based creation like "std:3".
 */
class HashFactory {
public:
    /**
     * @brief Constructs a hash function based on a signature (e.g., "std:3").
     * @param signature The string signature.
     * @return A new shared pointer to a hash function.
     * @throws std::invalid_argument or std::runtime_error if format/type is invalid.
     */
    static std::shared_ptr<IHashFunction> fromSignature(const std::string& signature);
};
