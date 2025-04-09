# Memento Lab Demo

This file includes the setup and running instructions for Memento, specifically tailored to running on the ECE 493 provided Samsung Galaxy A16 5G phone for Group 12.

## Prerequisites

1. For the backend:
   - See [Backend > Prerequisites](backend/README.md#prerequisites)
2. For the frontend (app):
   - See [App > Prerequisites](app/README.md#prerequisites)
   - Android Debug Bridge [(adb)](https://developer.android.com/tools/adb)

## Running the Project

### Backend Setup

1. Start the backend server:
   ```bash
   cd backend
   poetry run start
   ```

More details in [Backend > Running](backend/README.md#running)

### Running App on the Lab Phone

1. Connect the device to your computer via USB
2. Run `adb devices` to ensure the device is connected (should see R5CXC1A1JXV or another device ID)
3. Run the following command to make the backend server accessible on the device:
   ```bash
   adb -s R5CXC1A1JXV reverse tcp:8000 tcp:8000
   ```
4. Ensure `EXPO_PUBLIC_API_HOST=127.0.0.1` in `/app/.env`
5. Start the app:
   ```bash
   cd app
   pnpm android  # Builds an Android development build and installs it onto phone
   ```

The app should now be able to be used on the Samsung phone. Tap the Memento app icon to get started! This can be used for testing out different features or running the manual tests outlined in the test plan.

For more details, see [App > Physical Android Device](app/README.md#physical-android-device)

## Running Tests

### Backend Tests

Run the backend unit tests:

```bash
cd backend
poetry run test
```

This will run Pytest tests and generate an HTML coverage report at `/backend/htmlcov/index.html`.

See [Backend > Tests](backend/README.md#tests) for more information.

### Frontend Tests

```bash
cd app
pnpm test
```

Runs Jest tests and generates a coverage report at `/app/coverage/index.html`.

See [App > Unit Testing](app/README.md#unit-testing) for details.

### E2E/UI Tests

#### Prerequisites

1. See [App > E2E Testing > Prerequisites](app/README.md#prerequisites-2) for the required Maestro prerequisites
2. Set the `EXPO_PUBLIC_E2E_TESTING=true` environment variable in `app/.env` to enable test user login
3. Restart the app server using `pnpm android`

#### Running

To run all test flows:

```bash
cd app
pnpm test:e2e
```

## Additional Resources

- [App documentation](app/README.md)
- [Backend documentation](backend/README.md)
