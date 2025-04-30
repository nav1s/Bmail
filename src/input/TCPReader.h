#pragma once

#include "InputReader.h"
#include <sys/socket.h>

class TCPReader: public InputReader {
public:

    /**
     * @brief gets a line from the TCP socket.
     * 
     * @param string& line The string to store the line in.
     * @return true if successful, false if an error occurred or the connection was closed.
     */
    bool getLine(std::string &line) override;

private:
    int socket_fd;
    char buffer[1024];
};