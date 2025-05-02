#pragma once

#include <string>

class IServer {
public:
  /**
   * @brief Initializes the server socket and binds it to the specified address and port.
   *
   * @return true if the socket was successfully initialized, false otherwise.
   */
  virtual bool initializeServer() = 0;

  /**
   * @brief Accepts a new connection from a client.
   *
   * @return The file descriptor for the accepted socket.
   */
  virtual int acceptConnection() = 0;

  /**
   * @brief Checks if there is an active connection.
   *
   * @return true if there is an active connection, false otherwise.
   */
  virtual bool isConnected() const = 0;

};