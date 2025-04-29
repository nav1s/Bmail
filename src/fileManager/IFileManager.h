#pragma once

/**
 * @interface IFileManager
 * @brief An interface for saving and loading any object to and from a file.
 *
 * This interface enables type-erased serialization via void pointers. Concrete implementations
 * must be aware of the object type they handle.
 */
class IFileManager {
public:
    /**
     * @brief Saves the provided object to the file.
     * @param object Pointer to the object to save.
     */
    virtual void save(void* object) const = 0;

    /**
     * @brief Loads the object data from the file into the provided object.
     * @param object Pointer to the object to populate.
     */
    virtual void load(void* object) const = 0;

    /**
     * @brief Virtual destructor.
     */
    virtual ~IFileManager() = default;
};
