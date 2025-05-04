#include "TCPServer.h"
#include <iostream>
#include <unistd.h>
#include <cstring>

TCPServer::TCPServer(const std::string& ip_address, int port, int max_connections)
    : is_connected(false), ip_address(ip_address), port(port), max_connections(1)
      {
};

void TCPServer::closeConnection() {
    close(socket_fd);
    is_connected = false;
}

TCPServer::~TCPServer() {
    closeConnection();
}

bool TCPServer::isConnected() const {
    return is_connected;
}

bool TCPServer::initializeServer() {
    // try to connect to the socket
    socket_fd = socket(AF_INET, SOCK_STREAM, 0);
    // print an error if we failed
    if (socket_fd < 0) {
        perror("error creating socket");
        return false;
    }

    // create a new struct for the socket address
    struct sockaddr_in sin;
    memset(&sin, 0, sizeof(sin));
    sin.sin_family = AF_INET;
    sin.sin_addr.s_addr = INADDR_ANY;
    sin.sin_port = htons(port);

    // check if we can bind the socket
    if (bind(socket_fd, (struct sockaddr *) &sin, sizeof(sin)) < 0) {
        perror("error binding socket");
        return false;
    }
    
    // check if we got an error when listening to the socket
    if (listen(socket_fd, max_connections) < 0) {
        perror("error listening to a socket");
        return false;
    }

    std::cout << "Server initialized on " << ip_address << ":" << port << std::endl;
    return true;
}

int TCPServer::acceptConnection() {
    // set up the client socket
    struct sockaddr_in client_sin;
    unsigned int addr_len = sizeof(client_sin);
    int client_sock = accept(socket_fd,  (struct sockaddr *) &client_sin,  &addr_len);
    std::cout << client_sin.sin_addr.s_addr << std::endl;
    std::cout << client_sin.sin_port << std::endl;

    // check if we got an error when accepting the socket
    if (client_sock < 0) {
        perror("error accepting client");
        return -1;
    }

    return client_sock;
}