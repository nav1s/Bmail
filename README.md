# Bmail

This project implements a console application demonstrating the use of a Bloom filter.
Users can add urls to the filter and query whether a url has been blocked.

It utilizes Docker for building and running both the main application and the unit tests, ensuring a consistent environment.

## Usage

### Running the Application

    ```bash
    docker build --tag bmail-app --file Dockerfile.build .
    docker run --rm --interactive --tty --volume "$PWD":/app --workdir /app bmail-app bash -c "
        mkdir -p build/app && \
        cd build/app && \
        cmake ../.. && \
        make && \
        ./filter"
    ```

### Running the Unit Tests

    ```bash
    docker build --tag bmail-tests --file Dockerfile.tests .
    docker run --rm --volume "$PWD":/app --workdir /app bmail-tests bash -c "
        mkdir -p build/tests && \
        cd build/tests && \
        cmake ../../tests && \
        make && \
        ./runTests"
    ```
