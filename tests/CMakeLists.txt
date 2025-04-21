cmake_minimum_required(VERSION 3.10)

project(Bmail-tests)

set(CMAKE_CXX_STANDARD 11)

include(FetchContent)
FetchContent_Declare(
    googletest
    URL https://github.com/google/googletest/archive/refs/tags/release-1.11.0.zip
)

# For Windows: Prevent overriding the parent project's compiler/linker settings
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

add_executable(runTests ./UrlValidatorTest.cpp ../src/StringValidator/UrlValidator.cpp)

target_link_libraries(runTests gtest_main)
