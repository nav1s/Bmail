#pragma once

#include "IServer.h"
#include <netinet/in.h>
#include <string>
#include <sys/socket.h>

/**
 * @class TCPConnectionHandler
 * @brief Handles TCP connections
 *
 * This class is responsible for establishing TCP connections.
 */
class TCPServer : public IServer {
public:
  /**
   * @brief Initializes the server socket and binds it to the specified address and port.
   *
   * @return true if the socket was successfully initialized, false otherwise.
   */
  bool initializeServer() override;

  /**
   * @brief Accepts a new connection from a client.
   *
   * @return The file descriptor for the accepted socket.
   */
  int acceptConnection() override;

  /**
   * @brief Closes the current connection.
   */
  void closeConnection();

  /**
   * @brief Checks if there is an active connection.
   *
   * @return true if there is an active connection, false otherwise.
   */
  bool isConnected() const override;

  /**
   * @brief Constructs a TCP connection handler with the specified IP and port.
   *
   * @param ip_address The IP address to bind to or connect to.
   * @param port The port number to use.
   */
  TCPServer(const std::string &ip_address, int port, int max_connections = 1);

  /**
   * @brief Destructor for the TCPServer class.
   *
   * This destructor closes the socket if it is open.
   */
   ~TCPServer();


  /**
   * @brief Deleted copy constructor.
   */
  TCPServer(const TCPServer &other) = delete;

  /**
   * @brief Deleted copy assignment operator.
   */
  TCPServer &operator=(const TCPServer &other) = delete;

  /**
   * brief Deleted move constructor.
   */
  TCPServer(TCPServer &&other) = delete;

  /**
   * @brief Deleted move assignment operator.
   */
  TCPServer &operator=(TCPServer &&other) = delete;

private:
  std::string ip_address;
  int port;
  bool is_connected;
  int socket_fd;
  int max_connections;

};
