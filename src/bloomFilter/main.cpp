#include "app/App.h"
#include "filter/BloomFilter.h"
#include "hash/HashFactory.h"
#include "input/TCPReader.h"
#include "network/TCPServer.h"
#include "output/TCPWriter.h"
#include <algorithm>
#include <filesystem>
#include <iostream>
#include <mutex>
#include <thread>

using namespace std;

string bloomFilterLocation = "../../data";

/*
 * @brief Converts a vector of strings to a vector of integers.
 *
 * This function checks if each string in the input vector is a valid number. If any string is not a number,
 * it returns false. Otherwise, it converts the strings to integers and stores them in the output vector.
 *
 * @param strVec The input vector of strings.
 * @param numVec The output vector of integers.
 * @return true if all strings are valid numbers and conversion was successful.
 * @return false if any string is not a valid number or conversion failed.
 */
bool convertStringVectorToNumberVector(const std::vector<std::string> &strVec, std::vector<int> &numVec) {
    for (const auto &str : strVec) {
        // check if the item is a number
        if (!std::all_of(str.begin(), str.end(), ::isdigit)) {
            std::cerr << "Error: " << str << " is not a number." << std::endl;
            return false;
        }
        int number = std::stoi(str);
        if (number == 0) {
            return false;
        }
        // add the number to the vector
        numVec.push_back(std::stoi(str));
        // std::cout << "item: " << *item << std::endl;
    }
    return true;
}

/*
 * @brief This function creates hash functions based on the provided arguments.
 * The arguments are expected to be integers representing the hash function types.
 * @param args vector<int>& args
 * @param out vector<shared_ptr<IHashFunction>>& out
 */
void hashAssembler(vector<int> &args, vector<shared_ptr<IHashFunction>> &out) {
    for (int num : args) {
        string signature = "std:" + to_string(num);
        out.push_back(HashFactory::fromSignature(signature));
    }
}

/*
 * @brief Main function for the TCP server.
 *
 * This function initializes the TCP server, accepts a client connection, and runs the application logic.
 * It takes command-line arguments for IP address, port, and bloom filter parameters.
 *
 * @param argc The number of command-line arguments.
 * @param argv The command-line arguments.
 * @return int Exit status of the program.
 */
int main(int argc, char *argv[]) {
    // Check if the correct number of arguments is provided
    if (argc <= 5) {
        std::cerr << "Usage: ./tcp-server ip_address port bloom-filter-array-size hash-function1 hash-function2 ..."
                  << std::endl;
        return 1;
    }

    std::string ip_address = argv[1];
    std::string port = argv[2];

    // save all of the arguments after the first two in a vector
    std::vector<std::string> stringArgs(argv + 3, argv + argc);
    std::vector<int> numArgs;

    // attempt to convert the string arguments to numbers
    if (!convertStringVectorToNumberVector(stringArgs, numArgs)) {
        return 1;
    }

    std::cout << "IP Address: " << ip_address << std::endl;
    std::cout << "Port: " << port << std::endl;
    TCPServer server(ip_address, std::stoi(port), 1);

    server.initializeServer();

    size_t arraySize = numArgs.front();
    numArgs.erase(numArgs.begin());

    // creating hash functions and filter
    std::vector<std::shared_ptr<IHashFunction>> hashFunctions;
    hashAssembler(numArgs, hashFunctions);
    std::shared_ptr<IFilter> filter;

    filter = make_shared<BloomFilter>(arraySize, hashFunctions, bloomFilterLocation);

    if (filesystem::exists(bloomFilterLocation)) {
        filter->loadFromFile();
    }

    // create a mutex to protect the filter from concurrent access
    std::mutex filterMutex;

    // todo fix www.1.com as invalid url
    // loop forever, accepting connections
    while (true) {
        int clientSocket = server.acceptConnection();
        // print the client socket
        std::cout << "Accepted connection from client socket: " << clientSocket << std::endl;

        // Create objects on the heap so they persist after this scope
        auto reader = std::make_shared<TCPReader>(clientSocket);
        auto writer = std::make_shared<TCPWriter>(clientSocket);
        auto app = std::make_shared<App>();

        // Pass shared_ptr objects to the thread
        std::thread appThread([reader, writer, app, filter]() {
            app->run(*reader, *writer, filter);
        });

        // app.run(reader, writer, filter, bloomFilterLocation);
        // start the application in a new thread

        // Detach the thread to allow it to run independently
        appThread.detach();
    }
}