# Running the System
## Cloning the Repository

```bash
# Using HTTPS
git clone https://github.com/binja12/bmail.git
cd bmail

# OR using SSH
git clone git@github.com:binja12/bmail.git
cd bmail
```

## Running the web server and client
### Prerequisites
- Docker
- Docker Compose

### Creating an env file

```bash
# Create a new .env.prod file from the template
cp src/webServer/env.example src/webServer/.env
# Generate a secure JWT secret token
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Append the JWT token for the env file
echo "JWT_SECRET=your_generated_token_here" >> src/webServer/.env
```

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
- Android Studio
- Android SDK installed
- Android device connected or emulator running

### Steps to run the Android client
1. Open the Android project in Android Studio.
2. Connect an Android device or start an emulator.
3. Run the project from Android Studio.

### Connecting the Android client to the server
#### Primary Method
##### locating adb from Android Studio

If you need to locate the `adb` (Android Debug Bridge) executable from Android Studio:

1. Open Android Studio.
2. Go to **File > Settings**
3. Navigate to **Languages & Frameworks > Android SDK**.
4. The path to `adb` is typically shown at the top as the **Android SDK Location**.
5. The `adb` executable is located in the `platform-tools` directory inside your SDK location.
6. add the `platform-tools` directory to your system's PATH environment variable for easier access.

##### Connecting via adb reverse
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

#### Secondary Method
Change the `api` value in `src/android/app/src/main/res/values/Strings.xml`
to `http://<your-host-ip>:8080` in order to
connect via your host's IP address (for android emulators use `http://10.0.2.2:8080`)
