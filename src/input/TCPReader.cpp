#include <string>
#include "TCPReader.h"

bool TCPReader::getLine(std::string &line) {
  // Read a line from the TCP socket
  ssize_t bytes_received = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
  // Check for errors or connection closure
  if (bytes_received <= 0) {
    return false;
  }

  // Null-terminate the buffer
  buffer[bytes_received] = '\0';
  line = std::string(buffer);
  return true;
}