FROM gcc:latest

# Install cmake
RUN apt-get update && apt-get install -y cmake

# Copy all files into container
COPY . /usr/src/mytest

# Set working directory
WORKDIR /usr/src/mytest

# Create build directory
RUN mkdir -p build

# Set working directory to build
WORKDIR /usr/src/mytest/build

# Run cmake and make
RUN cmake .. && make

# Set default command to run tests
CMD ["./filter"]
