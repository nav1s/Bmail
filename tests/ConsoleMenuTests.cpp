#include "../src/menu/ConsoleMenu.h"
#include <gtest/gtest.h>
#include <string>
#include "../src/input/CliReader.h"
#include "../src/Output/CliPrinter.h"
#include <memory>

using namespace std;

/**
 * @class ConsoleMenuTest
 * @brief Test fixture for ConsoleMenu unit tests.
 */
class ConsoleMenuTests : public ::testing::Test {
protected:
  ConsoleMenu *menu;

  void SetUp() override {
    CliReader reader;
    CLIPrinter printer;
    menu = new ConsoleMenu(reader, printer);
  }

  void TearDown() override {
    delete menu;
  }
};

/**
 * @brief Helper function to simulate user input for testing.
 */
void simulateInput(const std::string &input) {
  // 1. Create an input string stream from the provided string
  std::istringstream *in = new std::istringstream(input);

  // 2. Redirect std::cin's stream buffer to use the string stream's buffer
  std::cin.rdbuf(in->rdbuf());
}

/**
 * @brief Test case for valid menu command inputs.
 */
TEST_F(ConsoleMenuTests, ValidCommands) {
  simulateInput("2 www.example.com0\n");
  int commandId;
  string arg;

  menu->getCommand(commandId, arg);
  EXPECT_EQ(commandId, 2);
  EXPECT_EQ(arg, "www.example.com0");

  simulateInput("1 www.example.com0\n");
  menu->getCommand(commandId, arg);
  EXPECT_EQ(commandId, 1);
  EXPECT_EQ(arg, "www.example.com0");

  simulateInput("2 www.example.com1\n");
  menu->getCommand(commandId, arg);
  EXPECT_EQ(commandId, 2);
  EXPECT_EQ(arg, "www.example.com1");

  simulateInput("2 www.example.com11\n");
  menu->getCommand(commandId, arg);
  EXPECT_EQ(commandId, 2);
  EXPECT_EQ(arg, "www.example.com11");

  simulateInput("2 www.example.com4\n");
  menu->getCommand(commandId, arg);
  EXPECT_EQ(commandId, 2);
  EXPECT_EQ(arg, "www.example.com4");
}

/**
 * @brief Test case for invalid menu command inputs.
 */
TEST_F(ConsoleMenuTests, InvalidCommands) {
  int commandId;
  string arg;

  // Test invalid command input (non-number start)
  simulateInput("x www.example.com\n");
  menu->getCommand(commandId, arg);
  EXPECT_EQ(commandId, -1);
  EXPECT_EQ(arg, "");

  // Test empty input
  simulateInput("\n");
  menu->getCommand(commandId, arg);
  EXPECT_EQ(commandId, -1);
  EXPECT_EQ(arg, "");
  // Test input with just a number
  simulateInput("3\n");
  menu->getCommand(commandId, arg);
  EXPECT_EQ(commandId, -1);
  EXPECT_EQ(arg, "");

  // Test input with spaces
  simulateInput(" 4   www.example.com   \n");
  menu->getCommand(commandId, arg);
  EXPECT_EQ(commandId, -1);
  EXPECT_EQ(arg, "");

  // Test non existing commands
  simulateInput("3 www.example.com4\n");
  menu->getCommand(commandId, arg);
  EXPECT_EQ(commandId, -1);
  EXPECT_EQ(arg, "");

  simulateInput("200 www.example.com4\n");
  menu->getCommand(commandId, arg);
  EXPECT_EQ(commandId, -1);
  EXPECT_EQ(arg, "");
}