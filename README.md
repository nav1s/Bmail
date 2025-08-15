# Bmail

> **Previous parts of this project:**
> - Part 1: https://github.com/Binja12/Bmail/tree/part1
> - Part 2: https://github.com/Binja12/Bmail/tree/part2
> - Part 3: https://github.com/Binja12/Bmail/tree/part3
> - Part 4: https://github.com/Binja12/Bmail/tree/part4
> - Part 5: will be completed past the deadline due to miluim service

Bmail is a mail server application featuring a C++-based Bloom filter for blacklist management and a Node.js web server providing a RESTful API for mail operations.

The project also includes a Python client for interacting with the Bloom filter and utilizes Docker for streamlined deployment and testing.

## Getting Started

### How SOLID Principles Helped Us Handle Changes Smoothly

How SOLID Principles Helped Us Handle Changes Smoothly

When we built the project in Exercise 1, we made sure to follow SOLID principles so that we could easily adapt later without touching core parts of the code. That really paid off in this assignment:

- **Command Name Changes**
Command name changes (like turning POST into 1) didn’t cause any issues — we just updated the parser’s mapping. The rest of the system kept working exactly the same.

- **Adding New Commands**
Adding new commands like DELETE was super simple. Since each command is its own class, all we had to do was create a new one and plug it into the parser. No need to change existing logic.

- **Changes in Output Format**
Changes in output format did require a small change: we updated the return values of the command classes to support the new output. Still, thanks to our modular structure, this was easy to manage and didn’t affect the overall system flow.

- **Swapping Console I/O with TCP**
Moving from console to TCP I/O was surprisingly smooth. Because we used abstract Reader and Writer objects from the start, we only had to switch the implementations. The rest of the code didn’t even notice the difference.

Overall, because our system was built to be extendable from day one, we were able to make all these changes without doing any big rewrites nor major implementation changes.
