#pragma once
#include "OutputWriter.h"

/**
 * @class TCPWriter
 */
class TCPWriter : public OutputWriter {
public:
    /**
     * @brief Constructs a TCPWriter with the specified client socket.
     * 
     * @param clientSocket The socket file descriptor for the client connection.
     */
    TCPWriter(int clientSocket);

    /**
      * @brief Deleted copy constructor and assignment operator to prevent copying.
    */
    TCPWriter(const TCPWriter&) = delete;

    /**
      * @brief Deleted assignment operator to prevent copying.
    */
    TCPWriter& operator=(const TCPWriter&) = delete;

    /**
      * @brief Deleted move constructor and assignment operator to prevent moving.
    */
    TCPWriter(TCPWriter&&) = delete;
    /**
      * @brief Deleted move assignment operator to prevent moving.
    */
    TCPWriter& operator=(TCPWriter&&) = delete;

    ~TCPWriter() = default;

    bool putLine(const std::string& line) override;

private:
    int clientSocket;
};
