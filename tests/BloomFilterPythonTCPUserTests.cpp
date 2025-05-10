#include <gtest/gtest.h>
#include <cstdio>
#include <iostream>
#include <sstream>
#include <vector>
#include <thread>
#include <chrono>

using namespace std;

/**
 * @brief Launches a subprocess (CLI program) and feeds it input line by line.
 * 
 * This function opens a process using `popen()` in read/write mode, sends each input line 
 * as if typed by a user, and collects the program's stdout response.
 * 
 * @param inputLines A vector of strings representing the lines of input to send.
 * @return string The raw combined output (stdout) received from the subprocess.
 * 
 * @throws runtime_error If the subprocess cannot be opened.
 */
string runClientWithInput(const vector<string>& inputLines) {
    /*
    * replace source main function here
    */
    const char* cmd = "python3 ../../src/tcpClient.py tcp-server 12345";
    cout << "Launching command: " << cmd << endl;
    
    FILE* pipe = popen(cmd, "w");  // or "r+" if you're reading
    if (!pipe) {
        perror("popen failed");
        throw runtime_error("Failed to open pipe to client.");
    }
   
   
   


    // Send inputs
    for (const auto& line : inputLines) {
        fputs((line + "\n").c_str(), pipe);
        fflush(pipe);
        this_thread::sleep_for(chrono::milliseconds(100)); // Give client time to respond
    }

    fputs("quit\n", pipe);
    fflush(pipe);

    // Capture stdout from client
    char buffer[1024];
    stringstream output;
    while (fgets(buffer, sizeof(buffer), pipe)) {
        output << buffer;
    }

    pclose(pipe);
    return output.str();
}

/**
 * @brief Splits a multi-line string into individual non-empty lines.
 * 
 * This utility function takes the full raw output of a program and returns
 * a vector where each element is one line of output.
 * 
 * @param output A multi-line string (e.g., stdout from a subprocess).
 * @return vector<string> Vector of lines extracted from the output.
 */
vector<string> splitLines(const string& output) {
    vector<string> lines;
    istringstream iss(output);
    string line;
    while (getline(iss, line)) {
        if (!line.empty())
            lines.push_back(line);
    }
    return lines;
}

TEST(ClientIntegrationTest, AllCasesMerged) {
    vector<string> input = {
        // InitWithInvalidConfig
        // "0 3",                       // Invalid: size = 0
        // "1000 0",                    // Invalid: num = 0
        // "0 0",                       // Both invalid
        // "abc 3",                     // Non-numeric size
        // "1000 xyz",                  // Non-numeric hash count
        // "-1000 3",                   // Negative size
        // "1000 -3",                   // Negative hash count
        // "1000",                      // Missing hash count
        // "#",                         // Empty command

        // "1 www.beforeinit.com",      // POST before init
        // "2 www.beforeinit.com",      // GET before init
        // "3 www.beforeinit.com",      // DELETE before init
        // "POST www.beforeinit.com",   // POST before init
        // "GET www.beforeinit.com",    // GET before init
        // "DELETE www.beforeinit.com", // DELETE before init

        // "8 1 2",                     // Valid init: array size = 8, std:1, std:2

        // InvalidMetaCommands
        "42 www.test.com",                  // Totally unrecognized command
        "POST www.test.com POST www.google.com",  // Multiple commands in one line
        "POST www.test.com extra_arg",      // Extra arguments
        "POSTwww.test.com",                 // No space between command and URL
        "#",                                // Empty string
        "   ",                              // Only spaces

        // PostCommandEdgeCases
        "POST www.valid.com",               // Valid, will test after init
        "POST www.valid.com",               // Duplicate POST
        "POST",                             // Only command, no URL
        "POST   ",                          // Command with only spaces
        "post www.lower.com",               // Lowercase keyword
        "POST www.test.com extra",          // Extra arguments
        "POST ",                            // Space but no URL
        "POST      www.test.com",           // Too many spaces before URL
        "POST www.test .com",               // URL with internal space
        "POST www.test.com  ",              // Trailing space in URL
        " POST www.test.com",               // Leading space before command
        "   ",                              // Only whitespace
        "#",                                // Empty input

        // GetCommandEdgeCasesAndLogic
        "GET",                              // GET with no URL
        "GET   ",                           // GET with space
        "GET@",                             // malformed command
        "GET www.test.com",                 // Not in filter yet

        "POST www.test.com",                // Add URL
        "GET www.test.com",                 // Should return "true true"
        "GET www.TEST.com",                 // Case sensitivity check
        "GET www.tesst.com",                // Similar but not same
        "DELETE www.test.com",              // Delete
        "GET www.test.com",                 // Should return "false"

        // DeleteCommandCases
        "DELETE",                           // Delete with no URL
        "DELETE     ",                      // Space but no URL
        "DELETE www.valid.com extra",       // Extra arg
        "DELETE",                           // Only command
        "DELETEwww.valid.com",              // No space

        "POST www.valid.com",               // Add valid
        "DELETE www.valid.com",             // Delete
        "DELETE www.valid.com",             // Duplicate delete
        "GET www.valid.com",                // GET after delete → false

        "POST www.valid.com",               // Re-add
        "GET www.valid.com"                 // GET → true true
    };

    vector<string> expected = {
        // InitWithInvalidConfig (15 lines)
        "400 Bad Request", "400 Bad Request", "400 Bad Request", "400 Bad Request", "400 Bad Request",
        "400 Bad Request", "400 Bad Request", "400 Bad Request", "400 Bad Request", "400 Bad Request",
        "400 Bad Request", "400 Bad Request", "400 Bad Request", "400 Bad Request", "400 Bad Request",

        // Valid INIT (silent)

        // InvalidMetaCommands
        "400 Bad Request", "400 Bad Request", "400 Bad Request",
        "400 Bad Request", "400 Bad Request", "400 Bad Request",

        // PostCommandEdgeCases
        "201 Created", "201 Created",                   // First POST and duplicate
        "400 Bad Request", "400 Bad Request",           // POST, POST only spaces
        "400 Bad Request", "400 Bad Request",           // Lowercase, extra arg
        "400 Bad Request", "400 Bad Request",           // Space no URL, too many spaces
        "400 Bad Request", "400 Bad Request",           // Space inside URL, trailing space
        "400 Bad Request", "400 Bad Request",           // Leading space, only whitespace
        "400 Bad Request",                              // Empty input

        // GetCommandEdgeCasesAndLogic
        "400 Bad Request", "400 Bad Request", "400 Bad Request", "false",
        "201 Created", "true true", "false", "false", "204 No Content", "false",

        // DeleteCommandCases
        "400 Bad Request", "400 Bad Request", "400 Bad Request", "400 Bad Request", "400 Bad Request",
        "201 Created", "204 No Content", "204 No Content", "false",
        "201 Created", "true true"
    };

// TEST(ClientIntegrationTest, InitWithInvalidConfig) {
//     vector<string> input = {
//         "0 3",        // Invalid: size = 0
//         "1000 0",     // Invalid: num = 0
//         "0 0",        // Both invalid
//         "abc 3",      // Non-numeric size
//         "1000 xyz",   // Non-numeric hash count
//         "-1000 3",    // Negative size
//         "1000 -3",    // Negative hash count
//         "1000",       // Missing hash count
//         "#",           // Empty command
//         "1 www.beforeinit.com",     //  POST before init
//         "2 www.beforeinit.com",     //  GET before init
//         "3 www.beforeinit.com",     //  Delete before init
//         "POST www.beforeinit.com",     //  POST before init
//         "GET www.beforeinit.com",     //  GET before init
//         "DELETE www.beforeinit.com",     //  Delete before init
//         "8 1 2"  // Valid init: array size = 8, std:1, std:2
//     };*/

//     string rawOutput = runClientWithInput(input);
//     vector<string> actual = splitLines(rawOutput);

//     for (const string& line : actual) {
//         EXPECT_EQ(line, "400 Bad Request");
//     }
// }

// /*TEST(ClientIntegrationTest, InitWithValidConfig) {
//     vector<string> input = {
//         "8 1 2"  // Valid init: array size = 8, std:1, std:2
//     };

//     string rawOutput = runClientWithInput(input);
//     vector<string> actual = splitLines(rawOutput);

//     // Expect no output
//     ASSERT_TRUE(actual.empty());
// }*/

// TEST(ClientIntegrationTest, InvalidMetaCommands) {
//     vector<string> input = {
//         "8 1 2",                   // silent init line
//         "42 www.test.com",   // Totally unrecognized command
//         "POST www.test.com POST www.google.com",  // Multiple commands in one line
//         "POST www.test.com extra_arg",         // Extra arguments
//         "POSTwww.test.com",     // No space between command and URL
//         "#",                  // Empty string
//         "   "                // Only spaces
//     };

//     string rawOutput = runClientWithInput(input);
//     vector<string> actual = splitLines(rawOutput);

//     // All should respond with "400 Bad Request"
//     ASSERT_EQ(actual.size(), input.size());
//     for (const string& line : actual) {
//         EXPECT_EQ(line, "400 Bad Request");
//     }
// }

// TEST(ClientIntegrationTest, PostCommandEdgeCases) {
//     vector<string> input = {
//         "8 1 2",                   // silent init line
//         "POST www.valid.com",      // Valid, will test after init
//         "POST www.valid.com",      // Duplicate POST
//         "POST",                    // Only command, no URL
//         "POST   ",                 // Command with only spaces
//         "post www.lower.com",      // Lowercase keyword
//         "POST www.test.com extra", // Extra arguments
//         "POST ",                   // Space but no URL
//         "POST      www.test.com",  // Too many spaces before URL
//         "POST www.test .com",      // URL with internal space
//         "POST www.test.com  ",     // Trailing space in URL
//         " POST www.test.com",      // Leading space before command
//         "   ",                     // Only whitespace
//         "#"                         // Empty input
//     };

//     // Prepend a valid INIT to make sure test focuses on POST
//     input.insert(input.begin(), "1000 3");

//     // Expected: first POST should succeed, everything else → 400
//     vector<string> expected = {
//         // INIT is silent
//         "201 Created",           // Valid first POST
//         "201 Created",           // Duplicate
//         "400 Bad Request",       // POST only
//         "400 Bad Request",       // POST with spaces only
//         "400 Bad Request",       // Lowercase "post"
//         "400 Bad Request",       // Extra args
//         "400 Bad Request",       // Space no URL
//         "400 Bad Request",       // Too many spaces
//         "400 Bad Request",       // URL with internal space
//         "400 Bad Request",       // Trailing space
//         "400 Bad Request",       // Leading space
//         "400 Bad Request",       // Whitespace
//         "400 Bad Request"        // Empty input
//     };

//     string rawOutput = runClientWithInput(input);
//     vector<string> actual = splitLines(rawOutput);

//     ASSERT_EQ(actual.size(), expected.size());
//     for (size_t i = 0; i < expected.size(); ++i) {
//         EXPECT_EQ(actual[i], expected[i]) << "Failed at index " << i << ": input was \"#" << input[i+1] << "\"#";
//     }
// }

// TEST(ClientIntegrationTest, GetCommandEdgeCasesAndLogic) {
//     vector<string> input = {
//         "8 1 2",                   // silent init line
//         "GET",                      // ❌ GET with no URL
//         "GET   ",                   // ❌ GET with space
//         "GET@",                     // ❌ malformed command
//         "GET www.test.com",         // ❌ Not in filter yet

//         "POST www.test.com",         // ✅ Add URL
//         "GET www.test.com",         // ✅ Should return "true true"
//         "GET www.TEST.com",         // ❌ Case sensitivity check (not same)
//         "GET www.tesst.com",        // ❌ false positive or not found
//         "DELETE www.test.com",         // ✅ Delete
//         "GET www.test.com",         // ✅ Now should return "false"
//     };

//     vector<string> expected = {
//         "400 Bad Request",  // GET with no URL
//         "400 Bad Request",  // GET with only space
//         "400 Bad Request",  // malformed
//         "false",            // Not in bloom yet

//         "201 Created",      // POST success
//         "true true",        // GET confirms bloom + exists
//         "false",            // Case mismatch
//         "false",            // Similar but not same

//         "204 No Content",   // Deleted
//         "false"             // Now should not exist
//     };

//     string rawOutput = runClientWithInput(input);
//     vector<string> actual = splitLines(rawOutput);

//     ASSERT_EQ(actual.size(), expected.size());
//     for (size_t i = 0; i < expected.size(); ++i) {
//         EXPECT_EQ(actual[i], expected[i]) << "Mismatch at input: \"#" << input[i] << "\"#";
//     }
// }

// TEST(ClientIntegrationTest, DeleteCommandCases) {
//     vector<string> input = {
//         "8 1 2",                   // silent init line
//         "DELETE",                   // ❌ Delete with no URL
//         "DELETE     ",              // ❌ Space but no URL
//         "DELETE www.valid.com extra", // ❌ Extra arg
//         "DELETE",                        // ❌ Only command
//         "DELETEwww.valid.com",           // ❌ No space

//         "POST www.valid.com",          // ✅ Add valid
//         "DELETE www.valid.com",          // ✅ Delete
//         "DELETE www.valid.com",          // ❌ Duplicate delete
//         "GET www.valid.com",          // ❌ GET after delete → false

//         "POST www.valid.com",          // ✅ Re-add
//         "GET www.valid.com"           // ✅ GET → true true
//     };

//     vector<string> expected = {
//         "400 Bad Request",  // No URL
//         "400 Bad Request",  // Just spaces
//         "400 Bad Request",  // Extra arg
//         "400 Bad Request",  // Just "3"
//         "400 Bad Request",  // No space

//         "201 Created",      // Add
//         "204 No Content",   // First delete
//         "204 No Content",   // Second delete (silent success)
//         "false",            // Should be deleted

//         "201 Created",      // Re-add
//         "true true"         // Should be present again
//     };
    string rawOutput = runClientWithInput(input);
    vector<string> actual = splitLines(rawOutput);

    ASSERT_EQ(actual.size(), expected.size());
    for (size_t i = 0; i < expected.size(); ++i) {
        EXPECT_EQ(actual[i], expected[i]) << "Mismatch at input: \"#" << input[i] << "\"#";
    }
}
