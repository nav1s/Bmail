#include <string>
#include <sys/socket.h>
#include "TCPWriter.h"

TCPWriter::TCPWriter(int clientSocket) : clientSocket(clientSocket) {};

bool TCPWriter::putLine(const std::string &line) {
    // Check if the line is empty
    if (line.empty()) {
        return false;
    }

    // Convert the string to a C-style string
    const char *c_line = line.c_str();
    // Send the line to the client
    int sent_bytes = send(clientSocket, c_line, line.size(), 0);

    // check if we got an error when sending to the socket
    if (sent_bytes < 0) {
        return false;
    }

    return true;
}