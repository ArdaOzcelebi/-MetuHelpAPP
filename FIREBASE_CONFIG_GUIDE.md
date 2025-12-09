# Firebase Configuration Setup Guide

## Overview

The Firebase configuration has been refactored to use Expo's standard `EXPO_PUBLIC_*` environment variable convention. This makes the setup simpler and more robust for Expo projects.

## Changes Made

### 1. `src/firebase/firebaseConfig.ts`
- **Removed**: Complex `readExtra()` and `readEnv()` helper functions
- **Removed**: Dependency on `expo-constants` for reading config
- **Removed**: Support for legacy `NEXT_PUBLIC_*` and bare `FIREBASE_*` variables
- **Added**: Direct reading from `process.env.EXPO_PUBLIC_*` variables
- **Added**: Detailed console.log statements for debugging configuration values
- **Simplified**: The `resolveConfig()` function now directly reads from environment variables

### 2. `app.config.js`
- **Updated**: Now reads from `EXPO_PUBLIC_*` environment variables instead of `NEXT_PUBLIC_*`
- **Simplified**: Removed fallback logic for old variable names

## Setup Instructions

### Step 1: Create your `.env.local` file

Create a `.env.local` file in the root directory of your project with the following content:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key-here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Important**: Replace the placeholder values with your actual Firebase project credentials.

### Step 2: Verify your configuration

When you run the app, you should see detailed logging output like this:

```
[firebaseConfig] ============ Firebase Configuration Debug ============
[firebaseConfig] API Key: AIzaSy...
[firebaseConfig] Auth Domain: yourproject.firebaseapp.com
[firebaseConfig] Project ID: yourproject
[firebaseConfig] Storage Bucket: yourproject.firebasestorage.app
[firebaseConfig] Messaging Sender ID: 123456789
[firebaseConfig] App ID: 1:123456789:web:...
[firebaseConfig] ====================================================
[firebaseConfig] Initializing Firebase app with config...
[firebaseConfig] ✓ Firebase app initialized successfully
[firebaseConfig] ✓ Auth instance ready
```

If you see `(undefined/empty)` for any values, check your `.env.local` file.

## Troubleshooting

### Error: Firebase API key is missing

If you see this error:
```
Firebase API key is missing. Check .env.local file and ensure EXPO_PUBLIC_FIREBASE_API_KEY is set
```

**Solutions**:
1. Ensure `.env.local` exists in your project root
2. Verify all environment variables use the `EXPO_PUBLIC_` prefix
3. Restart your Expo development server after creating/modifying `.env.local`
4. Clear Metro bundler cache: `npx expo start -c`

### Error: auth/api-key-not-valid

This error means the API key is being loaded but is incorrect. Verify:
1. The API key in your `.env.local` matches your Firebase project settings
2. You've copied the entire API key without any extra spaces or characters
3. You're using the Web API key from Firebase Console

### Variables not loading

If environment variables aren't being loaded:
1. Restart your development server completely
2. Make sure the file is named exactly `.env.local` (not `.env` or `.env.development`)
3. Verify the dotenv package is installed: `npm install dotenv`

## Environment Variable Naming

All Firebase configuration variables **must** use the `EXPO_PUBLIC_` prefix:

- ✅ `EXPO_PUBLIC_FIREBASE_API_KEY`
- ✅ `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- ✅ `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- ❌ `FIREBASE_API_KEY` (old, not supported)
- ❌ `NEXT_PUBLIC_FIREBASE_API_KEY` (old, not supported)

## Security Note

The `.env.local` file is already in `.gitignore` and should **never** be committed to version control. Each developer/environment should have their own `.env.local` file.

For production builds, set these environment variables in your CI/CD pipeline or hosting platform.

## Debug Mode

The configuration now logs all loaded values when `getAuthInstance()` is called. This helps you:
- Verify which values are being loaded
- Identify missing or incorrect configuration
- Debug initialization issues

To see these logs, look for lines starting with `[firebaseConfig]` in your console/terminal.
