#pragma once
#include <string>

class IHashFunction {
public:
    virtual ~IHashFunction() = default;

    /**
     * @brief Hashes a string and returns a size_t value.
     */
    virtual size_t hash(const std::string& input) const = 0;

    /**
     * @brief Returns a unique signature string representing this hash function.
     *
     * This signature is used for serialization and deserialization of hash function
     * The signature format follows:
     * @code
     *   <type>:<param>
     *   e.g., "std:3", "murmur:1", "fnv:2"
     * @endcode
     *
     * @return A string representing the hash function type and its parameters.
     */
    virtual std::string getSignature() const = 0;

};
