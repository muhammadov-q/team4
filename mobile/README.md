### Architecture

The camera UI uses MVI: `CameraScreen` sends events to `CameraViewModel`, which exposes UI state and one-shot effects. Photo uploads go through `UploadPhotoUseCase`, `PhotoRepository`, and `PhotoUploadApi`. Android and iOS provide native camera and HTTP-client implementations; `AppContainer` wires the dependencies.

### Running the apps

The camera screen opens the device's built-in camera app when you tap **Take photo and send**. After you take and confirm a full-resolution photo, the app passes it to the prediction backend. Android reads the photo from a temporary file; iOS converts the picked image to JPEG data.

#### Prerequisites

- **Android:** Android Studio with the Android SDK and an Android emulator or connected device.
- **iOS:** Xcode with its iOS simulator runtimes, or a connected iOS device. iOS builds require macOS and Xcode.

#### Start the backend

From the repository root, start the FastAPI server in a terminal:

```bash
cd backend
uv sync
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Run on Android

1. In `shared/src/androidMain/kotlin/org/example/project/data/platform/PlatformHttpClient.android.kt`, set the backend URL for your target:
   - Android emulator (recommended for this setup): `http://127.0.0.1:8000` with ADB reverse enabled below.
   - Standard Android Studio emulator without ADB reverse: `http://10.0.2.2:8000`. This special address routes to the development computer; use it only if the emulator can reach the backend this way.
   - Physical device: `http://<computer-LAN-IP>:8000` (connect both devices to the same network).

   To use the recommended emulator setup, forward the host port:

   ```bash
   ~/Library/Android/sdk/platform-tools/adb reverse tcp:8000 tcp:8000
   ```

   The reverse forwards the emulator's local port `8000` to port `8000` on your computer. Re-run the command after restarting the emulator. Set the Android backend URL to `http://127.0.0.1:8000`.
2. For a physical device, make sure the backend is listening on `0.0.0.0` and that your firewall allows incoming connections on port `8000`.
3. Run the `androidApp` configuration in the IDE, or build the debug APK with:

   ```bash
   ./gradlew :androidApp:assembleDebug
   ```

The app uses Android's camera app to capture the photo. No in-app camera permission prompt is needed.

#### Run on iOS

1. In `shared/src/iosMain/kotlin/org/example/project/data/platform/PlatformHttpClient.ios.kt`, set the backend URL:
   - iOS simulator: `http://127.0.0.1:8000`
   - Physical device: `http://<computer-LAN-IP>:8000` (connect both devices to the same network).
2. Open the [/iosApp](./iosApp) project in Xcode and run it on a simulator or device.

Camera support in simulators may be limited or unavailable. For reliable photo capture, use a real device with a camera.

