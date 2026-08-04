# Beauty Service App — React Native Template

A production-ready React Native + Expo template for a beauty service booking application, powered by [OneEntry Headless CMS](https://oneentry.cloud).

Use it as a starting point for booking apps in beauty, wellness, fitness, or any appointment-based service business. All content — services, masters, offers, orders, notifications — is managed through the OneEntry admin panel.

## Tech Stack

- **React Native** 0.86 + **Expo SDK** 57
- **Expo Router** (typed routes)
- **NativeWind** (Tailwind CSS for React Native)
- **Redux Toolkit** + React Redux
- **React Native Reanimated** 4 + Gesture Handler
- **Firebase Cloud Messaging** for push notifications
- **OneEntry SDK** for CMS integration
- **TypeScript** throughout

## Requirements

- Node.js **20+**
- Yarn **4.x** (managed via [Corepack](https://yarnpkg.com/corepack) — the repo pins its version via `packageManager`)
- Xcode 15+ (for iOS builds)
- Android Studio + JDK 17 (for Android builds)
- CocoaPods (`brew install cocoapods` on macOS)
- A OneEntry project ([sign up free](https://oneentry.cloud))

## Setup

### 1. Clone and install

```bash
git clone https://github.com/OneEntry/reactnative-service-app-demo.git
cd reactnative-service-app-demo

# Enable Corepack (once per machine)
corepack enable

# Install dependencies
yarn install
```

### 2. Configure environment

Copy `.env` and fill in your OneEntry project credentials:

```env
EXPO_PUBLIC_API_URL=https://your-project.oneentry.cloud
EXPO_PUBLIC_API_KEY=your_api_key_here
EXPO_PUBLIC_POLICY_URL=https://account.oneentry.cloud/authentication/register#policy
```

- `EXPO_PUBLIC_API_URL` — the URL of your OneEntry project instance
- `EXPO_PUBLIC_API_KEY` — API key with `read` scope (generate in OneEntry admin → **Settings → API keys**)
- `EXPO_PUBLIC_POLICY_URL` — link shown on the registration screen

### 3. Firebase (for push notifications)

If you need push notifications, add your Firebase config files at the project root:

- `GoogleService-Info.plist` (iOS)
- `google-services.json` (Android)

These files are `.gitignore`d — get them from your Firebase console.

If you don't need push notifications, remove `@react-native-firebase/app`, `@react-native-firebase/messaging`, and `expo-notifications` from `package.json` and `app.json` → `plugins`.

### 4. Generate native projects

This is a CNG (Continuous Native Generation) project — the `ios/` and `android/` folders are regenerated from `app.json`:

```bash
npx expo prebuild
```

### 5. Run

```bash
# iOS
yarn ios

# Android (device or emulator connected)
yarn android

# Web
yarn web
```

## Project Structure

```
app/                    Expo Router screens (file-based routing)
components/             UI components (shared + feature-specific)
api/                    OneEntry SDK wrappers, HTTP layer
state/                  Redux slices + contexts
lib/                    Helpers, hooks, notifications
types/                  TypeScript declarations
assets/                 Images, fonts, icons
patches/                patch-package patches for third-party libs
plugins/                Custom Expo config plugins
scripts/                Build-time scripts
docs/                   Integration notes (Authorization, Orders)
```

## Building for Production

### Local build with EAS

Create a private `eas.json` (not committed) and configure your credentials:

```bash
npm install -g eas-cli
eas login
eas build --platform ios --profile production --local
eas build --platform android --profile production --local
```

See the [EAS Build docs](https://docs.expo.dev/build/introduction/) for cloud builds and store submission.

### Native builds

Alternatively, use standard Xcode / Gradle:

```bash
# iOS: open ios/BeautyServiceApp.xcworkspace in Xcode → Archive
# Android:
cd android && ./gradlew bundleRelease
```

## Documentation

- [Authorization flow](./docs/Authorization.md)
- [Orders flow](./docs/Orders.md)
- [OneEntry SDK reference](https://js-sdk.oneentry.cloud/docs/index/)
- [OneEntry platform docs](https://oneentry.cloud/instructions)

## License

MIT
