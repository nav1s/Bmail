# Bmail

> **Previous parts of the project:**
> - Part 1: https://github.com/Binja12/Bmail/tree/part1
> - Part 2: https://github.com/Binja12/Bmail/tree/part2

This project implements a server and client application demonstrating the use of a Bloom filter.
Users can add urls to the filter, query whether a url has been blocked and delete a url from the filter.

It utilizes Docker for building and running server, client and the unit tests, ensuring a consistent environment.

## Demo

![Bmail Demo](assets/ex2-example-run.gif)

## Getting Started

### Cloning the Repository

```bash
# Using HTTPS
git clone https://github.com/binja12/bmail.git
cd bmail

# OR using SSH
git clone git@github.com:binja12/bmail.git
cd bmail
```

## Usage

### Linux Instructions

#### Running the Application

```bash
docker compose down
COMPOSE_BAKE=true docker compose up --detach --pull always --remove-orphans --build --wait tcp-server
docker compose run --pull always --remove-orphans --rm tcp-client
```


The application preserves the Bloom filter state between runs. If you want to start with a fresh Bloom filter, delete the data file:
```bash
rm data/bloomFilter.txt
```

#### Running the Unit Tests including server running, deleting bloomfilter data from previous runs

```bash
docker compose up --detach --pull always --remove-orphans --build tcp-server &&
docker build --tag bmail-tests --file Dockerfile.tests . && \
rm data/bloomFilter.txt
docker run --rm \
--network bmail \
--volume "$PWD":/app --workdir /app bmail-tests bash -c "
mkdir -p build/tests && \
cd build/tests && \
cmake ../../tests && \
make && \
./runTests" &&
docker compose down tcp-server
```



### Windows Instructions

#### Running the Application

```powershell
docker compose down
COMPOSE_BAKE=true docker compose up --detach --pull always --remove-orphans --build --wait tcp-server
docker compose run --pull always --remove-orphans --rm tcp-client
```

The application preserves the Bloom filter state between runs. If you want to start with a fresh Bloom filter, delete the data file:
```bash
rm data/bloomFilter.txt
```

#### Running the Unit Tests including server running, deleting bloomfilter data from previous runs

```bash
docker compose up --detach --pull always --remove-orphans --build tcp-server &&
docker build --tag bmail-tests --file Dockerfile.tests . && \
rm data/bloomFilter.txt
docker run --rm \
--network bmail \
--volume "${PWD}":/app --workdir /app bmail-tests bash -c "
mkdir -p build/tests && \
cd build/tests && \
cmake ../../tests && \
make && \
./runTests" &&
docker compose down tcp-server
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

Overall, because our system was built to be extendable from day one, we were able to make all these changes without doing any big rewrites gnor major implemintation changes.

## UML Diagram

The UML diagram for the project structure:

![Bmail UML Diagram](assets/bmail.png)

The source PlantUML code for this diagram is available in [assets/bmail-uml-diagram.puml](assets/bmail-uml-diagram.puml).

### Creating the UML Diagram

To regenerate the diagram:

```bash
# Install PlantUML
sudo apt install plantuml

# Generate the diagram
plantuml assets/bmail-uml-diagram.puml
```