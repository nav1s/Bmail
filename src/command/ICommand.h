// ===== File: ICommand.h =====
// Interface for command pattern. Each command should implement execute()

#ifndef ICOMMAND_H
#define ICOMMAND_H

/**
 * @class ICommand
 * @brief Abstract interface for a command in the command pattern.
 */
class ICommand {
public:
    /*
    * @brief Virtual destructor
    */
    virtual ~ICommand() = default;

    /**
     * @brief Executes the command.
     */
    virtual bool execute() = 0;
};

#endif  // ICOMMAND_H