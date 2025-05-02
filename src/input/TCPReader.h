#pragma once

#include "InputReader.h"
#include <cstring>
#include <sys/socket.h>

class TCPReader : public InputReader {
public:
  /**
   * @brief Constructs a TCPReader with the specified socket.
   *
   * @param clientSocket The socket to read from.
   */
  TCPReader(int clientSocket);

  /**
   * @brief Deleted copy constructor.
   */
  TCPReader(const TCPReader &other) = delete;

  /**
   * @brief Deleted copy assignment operator.
   */
  TCPReader &operator=(const TCPReader &other) = delete;

  /**
  * brief Deleted move constructor.
   */
  TCPReader(TCPReader &&other) = delete;

  /**
   * @brief Deleted move assignment operator.
   */
  TCPReader &operator=(TCPReader &&other) = delete;

  /**
   * @brief Destructor
   */
  ~TCPReader();

  /**
   * @brief gets a line from the TCP socket.
   *
   * @param string& line The string to store the line in.
   * @return true if successful, false if an error occurred or the connection was closed.
   */
  bool getLine(std::string &line) override;

private:
  int clientSocket;
  char buffer[1024];
};