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
UID=$(id --user) GID=$(id --group) COMPOSE_BAKE=true docker compose up --detach --pull always --remove-orphans --build --wait bloom-filter web-server
```

#### Running the python client
```bash
UID=$(id --user) GID=$(id --group) docker compose --file python-compose.yml --file compose.yml run --pull always --remove-orphans --rm python-client

```

The application preserves the Bloom filter state between runs. If you want to start with a fresh Bloom filter, delete the data file:
```bash
rm data/bloomFilter.txt
```

#### Running the Unit Tests including server running, deleting bloomfilter data from previous runs

```bash
docker compose down
UID=$(id --user) GID=$(id --group) docker compose up --detach --pull always --remove-orphans --build bloom-filter &&
docker build --tag bmail-tests --file Dockerfile.tests . && \
rm data/bloomFilter.txt
docker run --rm \
--network bmail \
--user $(id --user):$(id --group) \
--volume "$PWD":/app --workdir /app bmail-tests bash -c "
mkdir -p build/tests && \
cd build/tests && \
cmake ../../tests && \
make && \
./runTests" &&
UID=$(id --user) GID=$(id --group) docker compose down tcp-server
```

### Windows Instructions

#### Running the Application

```powershell
docker compose down
COMPOSE_BAKE=true docker compose up --detach --pull always --remove-orphans --build --wait bloom-filter web-server
```

The application preserves the Bloom filter state between runs. If you want to start with a fresh Bloom filter, delete the data file:
```bash
rm data/bloomFilter.txt
```

#### Running the Unit Tests including server running, deleting bloomfilter data from previous runs

```bash
docker compose up --detach --pull always --remove-orphans --build &&
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
