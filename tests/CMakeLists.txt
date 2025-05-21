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
../src/bloomFilter/fileManager/BloomFilterFileManager.cpp
../src/bloomFilter/filter/BloomFilter.cpp

../src/bloomFilter/hash/HashFactory.cpp
../src/bloomFilter/input/FileReader.cpp
../src/bloomFilter/hash/StdHash.cpp

./UrlValidatorTests.cpp 
../src/bloomFilter/validator/UrlValidator.cpp

./FilterCommandValidatorTests.cpp
../src/bloomFilter/validator/FilterCommandValidator.cpp

./FileReaderTests.cpp
../src/bloomFilter/input/FileReader.cpp

./CliReaderTests.cpp
../src/bloomFilter/input/CliReader.cpp

./StdHashTests.cpp
../src/bloomFilter/hash/StdHash.h

./HashFactoryTests.cpp
../src/bloomFilter/hash/HashFactory.cpp

./AppTests.cpp
../src/bloomFilter/app/App.cpp
../src/bloomFilter/command/AddFilterCommand.cpp
../src/bloomFilter/command/QueryFilterCommand.cpp
../src/bloomFilter/command/DeleteFilterCommand.cpp
../src/bloomFilter/menu/ConsoleMenu.cpp
../src/bloomFilter/output/CliPrinter.cpp
../src/bloomFilter/validator/StringValidator.cpp
)

target_link_libraries(runTests gtest_main)
