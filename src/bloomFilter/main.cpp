#include "app/App.h"
#include "filter/FilterFactory.h"
#include "input/TCPReader.h"
#include "network/TCPServer.h"
#include "output/TCPWriter.h"
#include <algorithm>
#include <iostream>
#include <mutex>
#include <stdexcept>
#include <thread>

using namespace std;

const string bloomFilterLocation = "../../data";

// Structure to hold server configuration
struct ServerConfig {
    string ip_address;
    int port;
    size_t arraySize;
    vector<int> hashParams;
};

/**
 * @brief Validates and converts string arguments to integers
 */
bool convertStringVectorToNumberVector(const vector<string> &strVec, vector<int> &numVec) {
    for (const auto &str : strVec) {
        if (!all_of(str.begin(), str.end(), ::isdigit)) {
            cerr << "Error: " << str << " is not a number." << endl;
            return false;
        }

        int number = stoi(str);
        if (number == 0) {
            return false;
        }

        numVec.push_back(number);
    }
    return true;
}

/**
 * @brief Parses and validates command line arguments
 */
ServerConfig parseArguments(int argc, char *argv[]) {
    if (argc <= 5) {
        throw runtime_error(
            "Usage: ./tcp-server ip_address port bloom-filter-array-size hash-function1 hash-function2 ...");
    }

    ServerConfig config;
    config.ip_address = argv[1];
    config.port = stoi(argv[2]);

    // Parse numeric arguments
    vector<string> stringArgs(argv + 3, argv + argc);
    vector<int> numArgs;

    if (!convertStringVectorToNumberVector(stringArgs, numArgs)) {
        throw runtime_error("Invalid numeric arguments provided");
    }

    // setup the array size and hash parameters
    config.arraySize = numArgs.front();
    numArgs.erase(numArgs.begin());
    config.hashParams = numArgs;

    return config;
}

/**
 * @brief Handles a single client connection
 */
void handleClient(int clientSocket, shared_ptr<IFilter> filter, shared_ptr<mutex> filterMutex) {
    // Create reader/writer for this specific client
    auto reader = make_shared<TCPReader>(clientSocket);
    auto writer = make_shared<TCPWriter>(clientSocket);
    auto app = make_shared<App>();

    // Run the app for this client
    app->run(*reader, *writer, filter, filterMutex);
}

/**
 * @brief Runs the server and handles incoming connections
 */
void runServer(const ServerConfig &config, shared_ptr<IFilter> filter, shared_ptr<mutex> filterMutex) {
    cout << "Starting server on " << config.ip_address << ":" << config.port << endl;

    TCPServer server(config.ip_address, config.port, 5);
    if (!server.initializeServer()) {
        throw runtime_error("Failed to initialize server");
    }

    // Accept and handle connections
    while (true) {
        try {
            int clientSocket = server.acceptConnection();

            cout << "Accepted connection from client socket: " << clientSocket << endl;

            // Create a new thread to handle this client
            thread clientThread(handleClient, clientSocket, filter, filterMutex);
            clientThread.detach();
        } catch (const runtime_error &e) {
            cerr << "Error accepting connection: " << e.what() << endl;
        } catch (const exception &e) {
            cerr << "Unexpected error: " << e.what() << endl;
        }
    }
}

int main(int argc, char *argv[]) {
    try {
        // Parse command line arguments
        ServerConfig config = parseArguments(argc, argv);

        // Create mutex for thread safety
        auto filterMutex = make_shared<mutex>();

        // Create the filter using the factory
        auto filter = FilterFactory::createBloomFilter(config.arraySize, config.hashParams, bloomFilterLocation);

        // Run the server
        runServer(config, filter, filterMutex);
    } catch (const exception &e) {
        cerr << "Error: " << e.what() << endl;
        return 1;
    }
}