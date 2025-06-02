# Bmail

> **Previous parts of this project:**
> - Part 1: https://github.com/Binja12/Bmail/tree/part1
> - Part 2: https://github.com/Binja12/Bmail/tree/part2
> - Part 3: https://github.com/Binja12/Bmail/tree/part3

Bmail is a mail server application featuring a C++-based Bloom filter for blacklist management and a Node.js web server providing a RESTful API for mail operations.

The project also includes a Python client for interacting with the Bloom filter and utilizes Docker for streamlined deployment and testing.

## Demo

![Bmail Demo](assets/ex3-example-run.gif)

## Getting Started

### Cloning the Repository

```bash
# Using HTTPS
git clone https://github.com/binja12/bmail.git
cd bmail
git checkout part3

# OR using SSH
git clone git@github.com:binja12/bmail.git
cd bmail
git checkout part3
```

### Running the Application

```bash
docker compose down --remove-orphans
docker compose up --detach --pull always --remove-orphans --build --wait bloom-filter web-server
```

> **if you want to start with a fresh Bloom filter, delete the data file with the following command:**
```bash
rm data/bloomFilter.txt
```

### Sample curl commands for the api

> **register a new user:**

```bash
curl -i -X POST http://localhost:8080/api/users \
-H "Content-Type: application/json" \
-d '{
  "firstName": "Alice",
  "lastName": "Test",
  "username": "alice123",
  "password": "securepass"
}'
```

> **login as the new user:**
```bash
curl -i -X POST http://localhost:8080/api/tokens \
-H "Content-Type: application/json" \
-d '{
  "username": "alice123",
  "password": "securepass"
}'
```

> **get the user public info:**
```bash
curl -i -X GET http://localhost:8080/api/users/1
```

> **send a mail:**
```bash
curl -i -X POST http://localhost:8080/api/mails \
-H "Authorization: 1" \
-H "Content-Type: application/json" \
-d '{
  "to": ["alice123"], 
  "title": "Hello again",
  "body": "This should work"
}'
```

> **create a new label:**
```bash
curl -i -X POST http://localhost:8080/api/labels \
-H "Authorization: 1" \
-H "Content-Type: application/json" \
-d '{
  "name": "Important"
}'
```

> **search for a mail:**
```bash
curl -i -X GET http://localhost:8080/api/mails/search/This \
-H "Authorization: 1"
```

> **add a url to the blacklist:**
```bash
curl -i -X POST http://localhost:8080/api/blacklist \
-H "Authorization: 1" \
-H "Content-Type: application/json" \
-d '{ "url": "http://bad.com" }'
```

> **attempt to send a mail with a blacklisted url:**
```bash
curl -i -X POST http://localhost:8080/api/mails \
-H "Authorization: 1" \
-H "Content-Type: application/json" \
-d '{
  "to": ["alice123"],
  "title": "Try this site",
  "body": "Check this link: http://bad.com"
}'
```

> **remove a url from the blacklist:**
```bash
curl -i -X DELETE http://localhost:8080/api/blacklist/http%3A%2F%2Fbad.com \
-H "Authorization: 1"
```

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
