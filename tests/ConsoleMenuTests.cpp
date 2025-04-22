#include "../src/menu/ConsoleMenu.h"
#include <gtest/gtest.h>

class ConsoleMenuTest : public ::testing::Test {
protected:
  ConsoleMenu menu;
};

// Helper function to simulate user input
void simulateInput(const std::string &input) {
  // 1. Create an input string stream from the provided string
  std::istringstream *in = new std::istringstream(input);

  // 2. Redirect std::cin's stream buffer to use the string stream's buffer
  std::cin.rdbuf(in->rdbuf());
}

TEST_F(ConsoleMenuTest, ValidCommands) {
  simulateInput("2 www.example.com0\n");
  int command = menu.nextCommand();
  EXPECT_EQ(command, 2);

  simulateInput("1 www.example.com0\n");
  command = menu.nextCommand();
  EXPECT_EQ(command, 1);

  simulateInput("2 www.example.com1\n");
  command = menu.nextCommand();
  EXPECT_EQ(command, 2);

  simulateInput("2 www.example.com11\n");
  command = menu.nextCommand();
  EXPECT_EQ(command, 2);

  simulateInput("2 www.example.com4\n");
  command = menu.nextCommand();
  EXPECT_EQ(command, 2);
}

TEST_F(ConsoleMenuTest, InvalidCommands) {
  // Test invalid command input (non-number start)
  simulateInput("x www.example.com\n");
  int command = menu.nextCommand();
  EXPECT_EQ(command, -1);

  // Test empty input
  simulateInput("\n");
  command = menu.nextCommand();
  EXPECT_EQ(command, -1);

  // Test input with just a number
  simulateInput("3\n");
  command = menu.nextCommand();
  EXPECT_EQ(command, -1);

  // Test input with spaces
  simulateInput(" 4   www.example.com   \n");
  command = menu.nextCommand();
  EXPECT_EQ(command, -1);

  // Test non existing commands
  simulateInput("3 www.example.com4\n");
  command = menu.nextCommand();
  EXPECT_EQ(command, -1);

  simulateInput("200 www.example.com4\n");
  command = menu.nextCommand();
  EXPECT_EQ(command, -1);
}