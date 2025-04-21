# Bmail
fake gmail project

## usage
### commands to run the docker which runs the code:
```bash
docker build -t bloom-filter -f Dockerfile .
docker run bloom-filter
```

### commands to run the unit tests docker:
```bash
docker build -t bloom-filter-tests -f Dockerfile.tests .
docker run bloom-filter-tests
```
