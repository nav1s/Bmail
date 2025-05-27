cmake_minimum_required(VERSION 3.10)

project(Bmail)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(bloom-filter src/bloomFilter/app/App.cpp 
src/bloomFilter/command/AddFilterCommand.cpp 
src/bloomFilter/command/QueryFilterCommand.cpp 
src/bloomFilter/command/DeleteFilterCommand.cpp
src/bloomFilter/filter/BloomFilter.cpp 
src/bloomFilter/filter/FilterFactory.cpp
src/bloomFilter/main.cpp 
src/bloomFilter/menu/ConsoleMenu.cpp
src/bloomFilter/hash/StdHash.cpp
src/bloomFilter/validator/UrlValidator.cpp
src/bloomFilter/input/CliReader.cpp
src/bloomFilter/fileManager/BloomFilterFileManager.cpp
src/bloomFilter/hash/HashFactory.cpp
src/bloomFilter/input/FileReader.cpp
src/bloomFilter/output/CliPrinter.cpp
src/bloomFilter/validator/StringValidator.cpp
src/bloomFilter/network/TCPServer.cpp
src/bloomFilter/output/TCPWriter.cpp
src/bloomFilter/input/TCPReader.cpp
)
