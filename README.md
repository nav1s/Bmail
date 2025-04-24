# Bmail

This project implements a console application demonstrating the use of a Bloom filter.
Users can add urls to the filter and query whether a url has been blocked.

It utilizes Docker for building and running both the main application and the unit tests, ensuring a consistent environment.

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

The application preserves the Bloom filter state between runs. If you want to start with a fresh Bloom filter, delete the data file:
```bash
rm data/bloomFilter.txt
```

```bash
docker build --tag bmail-app --file Dockerfile.run .
docker run --rm --interactive --tty --volume "$PWD":/app --workdir /app bmail-app bash -c "
mkdir -p build/app && \
cd build/app && \
cmake ../.. && \
make && \
./filter"
```

#### Running the Unit Tests

```bash
docker build --tag bmail-tests --file Dockerfile.tests .
docker run --rm --volume "$PWD":/app --workdir /app bmail-tests bash -c "
mkdir -p build/tests && \
cd build/tests && \
cmake ../../tests && \
make && \
./runTests"
```

### Windows Instructions

#### Running the Application

The application preserves the Bloom filter state between runs. If you want to start with a fresh Bloom filter, delete the data file:
```bash
rm data/bloomFilter.txt
```

```powershell
docker build --tag bmail-app --file Dockerfile.run .
docker run --rm --interactive --tty --volume "${PWD}:/app" --workdir /app bmail-app bash -c "mkdir -p build/app && cd build/app && cmake ../.. && make && ./filter"
```

#### Running the Unit Tests

```powershell
docker build --tag bmail-tests --file Dockerfile.tests .
docker run --rm --volume "${PWD}:/app" --workdir /app bmail-tests bash -c "mkdir -p build/tests && cd build/tests && cmake ../../tests && make && ./runTests"
```

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

### Project Structure

The UML diagram shows the following components of the Bmail system:

- **App**: Main application controller that connects all components
- **Filter**: Implements the Bloom filter for URL blacklisting
- **Hash**: Provides hash functions for the Bloom filter
- **Command**: Implements the command pattern for operations
- **Menu**: Provides user interface mechanisms
- **Input**: Handles different input sources
- **StringValidator**: Validates inputs like URLs