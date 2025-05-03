#ifndef COMMAND_RESULT_H
#define COMMAND_RESULT_H

enum class CommandResult {
    OK_200,
    CREATED_201,
    NO_CONTENT_204,
    BAD_REQUEST_400,
    NOT_FOUND_404
};

#endif
