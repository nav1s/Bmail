cmake_minimum_required(VERSION 3.10)

project(Bmail)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(filter src/app/App.cpp 
src/command/AddFilterCommand.cpp 
src/command/QueryFilterCommand.cpp 
src/filter/BloomFilter.cpp 
src/main.cpp 
src/menu/ConsoleMenu.cpp
src/hash/StdHash.cpp
src/validator/UrlValidator.cpp
src/input/CliReader.cpp
src/fileManager/BloomFilterFileManager.cpp
src/hash/HashFactory.cpp
src/input/FileReader.cpp
src/output/CliPrinter.cpp
src/validator/StringValidator.cpp
)
