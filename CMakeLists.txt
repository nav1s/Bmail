cmake_minimum_required(VERSION 3.10)

project(Bmail)

set(CMAKE_CXX_STANDARD 11)

add_executable(filter src/app/App.cpp 
src/command/AddFilterCommand.cpp 
src/command/QueryFilterCommand.cpp 
src/filter/BloomFilter.cpp 
src/main.cpp 
src/menu/ConsoleMenu.cpp
src/hash/StdHash.cpp
src/StringValidator/UrlValidator.cpp
src/input/CliReader.cpp)
