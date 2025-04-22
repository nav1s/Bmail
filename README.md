# Bmail
fake gmail project

## usage
### commands to run the docker which runs the code:
```bash
docker build -t bloom-filter -f Dockerfile .
docker run --rm --volume "$PWD":/app --workdir /app bloom-filter bash -c "
    mkdir -p build;
    cd build;
    cmake .. && make;
    ./filter
"
```

### commands to run the unit tests docker:
```bash
docker build -t bloom-filter-tests -f Dockerfile.tests .
docker run --rm --volume "$PWD":/app --workdir /app bloom-filter-tests bash -c "
    mkdir -p tests-build;
    cd tests-build;
    cmake ../tests && make;
    ./runTests
"
```
