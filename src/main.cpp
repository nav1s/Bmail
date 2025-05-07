#include "app/App.h"
#include "input/TCPReader.h"
#include "network/TCPServer.h"
#include "output/TCPWriter.h"
#include <algorithm>
#include <iostream>
#include <fstream>

bool convertStringVectorToNumberVector(const std::vector<std::string>& strVec, std::vector<int>& numVec) {
    for (const auto& str : strVec) {
        // check if the item is a number
        if (!std::all_of(str.begin(), str.end(), ::isdigit)) {
            // std::cerr << "Error: " << str << " is not a number." << std::endl;
            return false;
        }
        // add the number to the vector
        numVec.push_back(std::stoi(str));
        // std::cout << "item: " << *item << std::endl;
    }
    return true;
}

int main(int argc, char* argv[]) {
    // Check if the correct number of arguments is provided
    if (argc <= 5) {
        std::cerr << "Usage: ./tcp-server ip_address port bloom-filter-array-size hash-function1 hash-function2 ..." << std::endl;
        return 1;
    }

    std::string ip_address = argv[1];
    std::string port = argv[2];

    // save everything after the first two arguments in a vector
    std::vector<std::string> stringArgs(argv+3, argv + argc);
    std::vector<int> numArgs;

    if (!convertStringVectorToNumberVector(stringArgs, numArgs)) {
        return 1;
    }

    std::cout << "IP Address: " << ip_address << std::endl;
    std::cout << "Port: " << port << std::endl;
    TCPServer server(ip_address, std::stoi(port));
    server.initializeServer();
    // create a new file for the docker health check
    std::ofstream file("/tmp/tcp-server.txt");
    if (!file) {
        std::cerr << "Error: Could not create file." << std::endl;
        return 1;
    }

    int clientSocket = server.acceptConnection();
    std::cout << "Client connected." << std::endl;

    TCPReader reader(clientSocket);
    TCPWriter writer(clientSocket);

    App app;
    app.run(reader, writer, numArgs);

    return 0;
}
