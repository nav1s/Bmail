#include "TCPReader.h"
#include <cstdio>
#include <iostream>
#include <unistd.h>

TCPReader::TCPReader(int clientSocket) : clientSocket(clientSocket) {}

bool TCPReader::getLine(std::string &line) {
    ssize_t bytesRead = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
    
    // error handling
    if (bytesRead < 0) {
        perror("recv");
        return false;
    // connection closed
    } else if (bytesRead == 0) {
        return false;
    
    }

    std::cout << "Received: " << buffer << std::endl;
    // Ensure null termination
    buffer[bytesRead] = '\0';
    
    // Convert to string and remove newline if present
    line = std::string(buffer);
    return true;
}

TCPReader::~TCPReader() = default;
