# Memento App

This mobile application is an [Expo](https://expo.dev) project that was created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app). Expo is a React Native framework that enables developing universal apps for both Android and iOS.

## Get Started

### Prerequisites

- Install [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm)
- Use nvm to install Node.js (v20+)
- Install [npm (Node's package manager).](https://www.npmjs.com/)
- Use npm to install [pnpm (faster and more efficient package manager)](https://pnpm.io/installation#using-npm)

#### Environment Variables

In the `/app/.env` file, ensure the following variables and credentials exist:

```bash
EXPO_PUBLIC_API_HOST=<YOUR_HOST_IP_ADDRESS> # for backend API calls
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=<API_KEY> # for Place Autocomplete and Place Details
```

### Running the app

1. Install dependencies

   ```bash
   pnpm i
   ```

2. Start the app

   ```bash
    pnpm start [--port <PORT_NUMBER>]
   ```

In the output, you'll find options to open the app in a

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

The easiest, quickstart option is to download the Expo Go app on your physical device and to scan the QR code presented in the terminal output to launch the app.

### Connecting to Backend

### On Local Network

To call the Backend APIs, the Expo app needs to know the IP address of the host the backend is running on. The app host and backend host should be on the same LAN. To specify the host IP, set the following environment variable in a `.env` file:

```
EXPO_PUBLIC_API_HOST = <host_machine_ip>
```

You can find the local IP using the command `ipconfig` in Windows or `ip addr show eth0` in Linux.

### On External Network (ex: UWS)

Certain networks such as UWS do not permit targeting a specific IP on the network due to firewall permissions. As a workaround for this, it is possible to tunnel both the development servers (app and backend) which makes them accessible to a mobile phone via Expo Go via the Internet.

A bash script has been written to handle the tunnel setup for the backend and connecting the app via an environemnt variable pointed to the tunneled host at runtime.

#### Prerequisites

1. Requires `npx` to be installed
2. Ensure the script has permission to be ran using `chmod +x ./scripts/tunnel-api.sh`.

#### Running

1. Start your local backend server: `poetry run start`
2. Expose the backend to the Internet via localtunnel: `pnpm tunnel-api`. This will also add a variable to `/app/.env` containing the host URL for the API.
3. Start the mobile app: `pnpm start:tunnel`

Overall, this double tunnel approach should allow your app to connect to the backend regardless of network setup/firewalls.

## Sync Backend API

This project uses [hey-api](https://heyapi.dev/) to automatically generate TypeScript types and API clients from the backend's OpenAPI definition.

To sync new backend changes to the mobile client:

1. Ensure the local backend server is running at http://localhost:8000/ with your new API changes
2. In the `/app` directory, run the command
   ```bash
   pnpm sync-api
   ```

This should generate new TypeScript clients/types inside the `/src/app/api-client/generated` folder that reflect the new or modified APIs.

## Unit Testing

Powered by [Jest](https://jestjs.io/).

```bash
 # pnpm i
 pnpm test
```

## E2E Testing

Powered by [Maestro](https://maestro.mobile.dev/), the simplest and most effective UI testing framework for mobile apps. Test flows are defined under the `e2e` folder.

### Prerequisites

- Android Emulator or iOS Simulator (MacOS)
- Download and install [Maestro CLI](https://maestro.mobile.dev/getting-started/installing-maestro)
  - for MacOS, Linux, or WSL:
  ```bash
  export MAESTRO_VERSION=1.39.0; curl -Ls "https://get.maestro.mobile.dev" | bash
  ```
  - for Windows, follow the instructions in link above
- set the `EXPO_PUBLIC_E2E_TESTING=true` environment variable in `app/.env` to enable test user login
- Memento app running on simulator/device (via Expo Go or Development Build)

### Run Locally

Follow the instructions provided in the Maestro documentation for [running flows](https://maestro.mobile.dev/getting-started/writing-your-first-flow). You must have an Android simulator or physical device running the Memento app before using the commands below:

- All test flows for project
  ```bash
  pnpm test:e2e
  ```
- Specific/individual flows
  ```bash
  maestro test <path-to-flow.yml>
  ```

### Run on EAS

To build the app and run Maestro tests in the cloud, an EAS configuration is defined in `.eas/build/e2e-test.yml`.

You can manually trigger the [EAS Build and E2E Test](https://github.com/owencooke/memento/actions/workflows/app-build.yml) GitHub Action to easily run the E2E tests on EAS.

Alternatively, the tests can be ran using the EAS CLI.

1. Ensure the EAS CLI is installed
   ```bash
   eas -v # otherwise, run: npm install --global eas-cli
   ```
2. To kickoff the E2E testing in EAS
   ```bash
   eas build --platform <android | ios | all> --profile e2e-test
   ```

Refer to the Expo Docs for more information about [custom EAS builds](https://docs.expo.dev/custom-builds/schema/#easmaestro_test).

## Development Devices

By far the most configuration-heavy and tricky part of mobile development, many of the prerequisites required to run an Android Emulator, iOS Simulator, or on a physical device will depend on your local machine/environments.

It is recommended to follow official documentation for installing/running emulators.

### Physical Android Device

ECE 493 provided Samsung Galaxy A16 5G phones for testing in the lab. Instructions for running are below:

1. Enable [USB debugging](https://www.rogers.com/support/device-guides/en/mobile/tutorial/galaxy-a16-5g/14.0.0/feature_settings_debugging-enabling-usb-debugging) for the Android device and connect to computer via USB.
2. Run the command `adb -s R5CXC1A1JXV reverse tcp:8000 tcp:8000` to make the backend server accessible directly on the Android device (ex: go to `localhost:8000/docs` in phone browser to test) and ensure `EXPO_PUBLIC_API_HOST=127.0.0.1` in the `/app/.env` file.
3. Start the Metro server for the app:
   - `pnpm start` will allow you to open the app within Expo Go.
   - `pnpm android` will build an Android development build and install it directly on the device.

### Android Emulator

Follow the [Android Developer documentation](https://developer.android.com/tools) for installing the Android SDK command-line tools (for `avdmanager`, `adb` and `emulator`). Alternatively, it is possible to use [Android Studio ](https://developer.android.com/tools/sdkmanager) to create devices and manage the Android SDK.

#### Building app for Android

Building the app and its dependencies can be quite memory intensive thanks to Gradle. Running `pnpm android` requires the emulator to be launched, but will kickoff the full Gradle build process if it hasn't been done yet. The combo of the running emulator + Gradle can overwhelm your system. It is recommended to build the dependencies first before running `pnpm android`. To do this:

1. Run `npx expo prebuild` (generates the `/android` directory for creating a native build via Gradle)
2. `cd android`
3. `./gradlew assembleDebug` to kickoff the Gradle build for the project's dependencies

Some other helpful commands are provided below for reference:

#### Running a specific AVD

This will launch a window running the virtual device.

```bash
emulator -avd Pixel_6_API_34
```

Tip: you can change the size of the emulated device using CTRL+UP or CTRL+DOWN.

#### Check emulator connected

```bash
adb devices
```

#### Building APK on emulator

```bash
pnpm android # debug mode
# or for production build: pnpm android:prod
```

**Note:** build may fail at first, requiring you to accept necessary SDK licences. Some of these commands may be helpful, depending on your environment.

```
sudo apt update && sudo apt install android-sdk
sudo chown -R $USER:$USER /usr/lib/android-sdk
sudo chmod -R 777 /usr/lib/android-sdk
yes | sdkmanager --licenses
```

#### Verifying installed package IDs

Can be helpful if Maestro flows can't launch the app on your emulator. Use this to verify the name of the package installed and the `appID` in the Maestro flow matches.

```bash
adb shell pm list packages
```

#### Manually installing build to emulator

Building native code takes a long time; ~20 minutes for a sample app in EAS Build, potentially much longer locally depending on your host machine.

An alternative option to building locally is to trigger an EAS build, then download the build artifact and manually install on your emulator using the command below.

```bash
adb install <path-to-apk>
# ex: android/app/build/outputs/apk/release/app-release.apk
```

## Additional Resources

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.
