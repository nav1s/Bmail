#include "app/App.h"
#include "input/TCPReader.h"
#include "network/TCPServer.h"
#include "output/TCPWriter.h"
#include <iostream>
#include <fstream>

int main(int argc, char* argv[]) {
    // Check if the correct number of arguments is provided
    if (argc != 3) {
        std::cerr << "Usage: ./tcp-server ip_address port" << std::endl;
        return 1;
    }

    std::string ip_address = argv[1];
    std::string port = argv[2];

    std::cout << "IP Address: " << ip_address << std::endl;
    std::cout << "Port: " << port << std::endl;
    TCPServer server(ip_address, std::stoi(port));
    std::ofstream out("/tmp/tcp-server");
    server.initializeServer();
    int clientSocket = server.acceptConnection();

    TCPReader reader(clientSocket);
    TCPWriter writer(clientSocket);

    App app;
    app.run(reader, writer);

    return 0;
}
