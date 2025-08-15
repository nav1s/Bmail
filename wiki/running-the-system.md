## Running the System
### Cloning the Repository

```bash
# Using HTTPS
git clone https://github.com/binja12/bmail.git
cd bmail
git checkout part4

# OR using SSH
git clone git@github.com:binja12/bmail.git
cd bmail
git checkout part4
```

### Running the Application

```bash
docker compose down --remove-orphans
docker compose up --detach --pull always --remove-orphans --build --wait bloom-filter web-server mongo mongo-express
```

Once the application is running, open your browser and go to [http://localhost:8080](http://localhost:8080).

> **When you are done using the application, shut down the containers with:**
```bash
docker compose down --remove-orphans
```

> **if you want to start with a fresh Bloom filter, delete the data file with the following command:**
```bash
rm data/bloomFilter.txt
```

