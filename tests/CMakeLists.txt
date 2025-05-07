cmake_minimum_required(VERSION 3.24)

project(BmailTests)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
FetchContent_Declare(
    googletest
    URL https://github.com/google/googletest/archive/refs/tags/release-1.11.0.zip
    DOWNLOAD_EXTRACT_TIMESTAMP TRUE
)

FetchContent_MakeAvailable(googletest)

add_executable(
runTests 
./tester.cpp

./BloomFilterTests.cpp
../src/fileManager/BloomFilterFileManager.cpp
../src/filter/BloomFilter.cpp

../src/hash/HashFactory.cpp
../src/input/FileReader.cpp
../src/hash/StdHash.cpp

./UrlValidatorTests.cpp 
../src/validator/UrlValidator.cpp

./FileReaderTests.cpp
../src/input/FileReader.cpp

./CliReaderTests.cpp
../src/input/CliReader.cpp

./StdHashTests.cpp
../src/hash/StdHash.h

./HashFactoryTests.cpp
../src/hash/HashFactory.cpp

./AppTests.cpp
../src/app/App.cpp
../src/command/AddFilterCommand.cpp
../src/command/QueryFilterCommand.cpp
../src/menu/ConsoleMenu.cpp
../src/output/CliPrinter.cpp
../src/validator/StringValidator.cpp

./BloomFilterPythonTCPUserTests.cpp
../src/tcpClient.py
)

target_link_libraries(runTests gtest_main)
