// Icommand - Interface for command pattern. Each command should implement execute()

#ifndef ICOMMAND_H
#define ICOMMAND_H

class ICommand {
public:
    virtual ~ICommand() = default;

    // Executes the command
    virtual void execute() = 0;
};

#endif // ICOMMAND_H