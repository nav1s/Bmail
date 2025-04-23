# Bmail
fake gmail project

## usage
### commands to run the docker which runs the code:
```bash
docker build --tag bloom-filter --file Dockerfile.build .
docker run --rm --volume "$PWD":/app --workdir /app bloom-filter bash -c "
    mkdir -p build/app;
    cd build/app;
    cmake ../.. && make;
    ./filter"
```

### commands to run the unit tests docker:
```bash
docker build --tag bloom-filter-tests --file Dockerfile.tests .
docker run --rm --volume "$PWD":/app --workdir /app bloom-filter-tests bash -c "
    mkdir -p build/tests;
    cd build/tests;
    cmake ../../tests && make;
    ./runTests"
```
