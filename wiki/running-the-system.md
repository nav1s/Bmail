# Running the System
## Cloning the Repository

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

## Running the web server and client
### Prerequisites
- Docker installed
- Docker Compose installed

### Steps to run the web server
After cloning the repository, navigate to the `bmail` directory and run the following commands:
```bash
docker compose down --remove-orphans
docker compose up --detach --pull always --remove-orphans --build --wait bloom-filter web-server mongo mongo-express
```

Once the application is running, open your browser and go to [http://localhost:8080](http://localhost:8080).

When you are done using the application, shut down the containers with:
```bash
docker compose down --remove-orphans
```

if you want to start with a fresh Bloom filter, delete the data file with the following command:
```bash
rm data/bloomFilter.txt
```

## Running the Android client
### Prerequisites
- Android Studio installed
- Android SDK and emulator set up
- Android device connected or emulator running

### Steps to run the Android client
1. Open the Android project in Android Studio.
2. Connect an Android device or start an emulator.
3. Run the project from Android Studio.

### Configuration
#### Default
The app connects to http://localhost:8080, 
Run the following command in your terminal
to reverse the port from your host machine to the Android device/emulator:
```bash
adb reverse tcp:8080 tcp:8080
```

if you have multiple devices/emulators connected find the device ID with:
```bash
adb devices
```
Then, to reverse the port for a specific device use:
```bash
adb -s <device-id> reverse tcp:8080 tcp:8080
```

#### Custom
Change the `api` value in `src/android/app/src/main/res/values/Strings.xml`
to `http://<your-host-ip>:8080` in order to
connect via your host's IP address (for android emulators use `http://10.0.2.2:8080`)
 