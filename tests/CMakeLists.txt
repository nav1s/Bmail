cmake_minimum_required(VERSION 3.10)

project(BmailTests)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
FetchContent_Declare(
    googletest
    URL https://github.com/google/googletest/archive/refs/tags/release-1.11.0.zip
)

FetchContent_MakeAvailable(googletest)

add_executable(
runTests 
./tester.cpp

./BloomFilterTests.cpp
../src/hash/HashFactory.cpp
../src/input/FileReader.cpp
../src/filter/BloomFilter.cpp
../src/hash/StdHash.cpp

./UrlValidatorTests.cpp 
../src/StringValidator/UrlValidator.cpp

./FileReaderTests.cpp
../src/input/FileReader.cpp

./CliReaderTests.cpp
../src/input/CliReader.cpp

./StdHashTests.cpp
../src/hash/StdHash.h

./HashFactoryTests.cpp
../src/hash/HashFactory.cpp

./BloomFilterFileManagerTests
../src/FileManager/BloomFilterFileManager.cpp
)

target_link_libraries(runTests gtest_main)
