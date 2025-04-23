#pragma once

#include "IHashFunction.h"
#include <string>

/**
 * @class StdHash
 * @brief Repeatedly applies std::hash<std::string> N times.
 *
 * This class implements the IHashFunction interface by hashing a string
 * using std::hash, repeating the hashing process `reps` times.
 */
class StdHash : public IHashFunction {
public:
    /**
     * @brief Constructs a StdHash object with the desired number of repetitions.
     * @param reps Number of times std::hash should be applied (must be >= 1).
     * @throws std::invalid_argument if reps < 1.
     */
    explicit StdHash(int reps);

    /**
     * @brief Copy constructor.
     */
    StdHash(const StdHash& other) = default;

    /**
     * @brief Move constructor.
     */
    StdHash(StdHash&& other) noexcept = default;

    /**
     * @brief Copy assignment operator.
     * Deleted to maintain immutability of the hash behavior.
     */
    StdHash& operator=(const StdHash& other) = delete;

    /**
     * @brief Move assignment operator.
     * Deleted to maintain immutability of the hash behavior.
     */
    StdHash& operator=(StdHash&& other) noexcept = delete;

    /**
     * @brief Destructor.
     */
    ~StdHash() override = default;

    /**
     * @brief Applies repeated hashing on the input string.
     * @param input The input string to hash.
     * @return The final hash result after `reps` repetitions.
     */
    size_t hash(const std::string& input) const override;

    /**
     * @brief Returns a string signature representing this hash function configuration.
     * @return A string like "std:n"
     */
    std::string getSignature() const override;


private:
    int reps; ///< Number of hash repetitions to apply
};
