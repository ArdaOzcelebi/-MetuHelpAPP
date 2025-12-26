# METU Help - MetuHelpAPP

A React Native mobile application built with Expo, designed to facilitate help requests and offers within the METU community.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Firebase Setup](#firebase-setup)
- [Development Guidelines](#development-guidelines)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

METU Help is a cross-platform mobile application that connects students and staff at Middle East Technical University (METU) to help each other. Users can post help requests, offer assistance, and browse available opportunities to contribute to the community.

**Key Features:**
- Browse help requests and offers
- Post and manage help requests
- Ask questions within the community
- User profile management
- Multi-language support (Turkish/English)
- Dark mode support
- Responsive design

**Supported Platforms:**
- iOS (Apple devices)
- Android (Google devices)
- Web (Browser-based)

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React Native 0.81.5 / Expo 54.0.23 |
| **Language** | TypeScript 5.9.2 |
| **Navigation** | React Navigation 7.x |
| **Backend** | Firebase (Auth + Firestore) |
| **Styling** | React Native native components with theme system |
| **Linting** | ESLint 9.25.0 |
| **Formatting** | Prettier 3.6.2 |
| **Build Tool** | Expo CLI |
| **Package Manager** | npm/yarn |


## 📁 Project Structure

```
-MetuAPP/
├── components/              # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── ErrorBoundary.tsx
│   ├── HeaderTitle.tsx
│   ├── LanguageToggle.tsx
│   ├── ScreenFlatList.tsx
│   ├── ScreenKeyboardAwareScrollView.tsx
│   ├── ScreenScrollView.tsx
│   ├── Spacer.tsx
│   ├── ThemedText.tsx
│   └── ThemedView.tsx
│
├── screens/                 # Screen components
│   ├── HomeScreen.tsx
│   ├── BrowseScreen.tsx
│   ├── AskQuestionScreen.tsx
│   ├── NeedHelpScreen.tsx
│   ├── OfferHelpScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── PostNeedScreen.tsx
│   ├── QuestionDetailScreen.tsx
│   └── RequestDetailScreen.tsx
│
├── navigation/              # Navigation configuration
│   ├── MainTabNavigator.tsx
│   ├── HomeStackNavigator.tsx
│   ├── BrowseStackNavigator.tsx
│   ├── ProfileStackNavigator.tsx
│   └── screenOptions.ts
│
├── contexts/                # React Context for state management
│   └── LanguageContext.tsx
│
├── hooks/                   # Custom React hooks
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   ├── useScreenInsets.ts
│   └── useTheme.ts
│
├── constants/               # Application constants
│   └── theme.ts
│
├── src/                     # Source code
│   ├── firebase/            # Firebase configuration
│   │   └── firebaseConfig.js
│   ├── services/            # API services
│   │   └── helpRequestService.ts
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx
│   └── types/               # TypeScript type definitions
│       └── helpRequest.ts
│
├── assets/                  # Static assets
│   └── images/
│
├── scripts/                 # Build and utility scripts
│   ├── build.js
│   └── landing-page-template.html
│
├── App.tsx                  # Root component
├── app.json                 # Expo configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── babel.config.js          # Babel configuration
├── eslint.config.js         # ESLint configuration
└── README.md                # This file
```

## 🔥 Firebase Setup

This application uses Firebase for authentication and data storage (Firestore). Follow these steps to configure Firebase for development or production.

### Required Environment Variables

All Firebase credentials must be stored in a `.env.local` file in the project root. This file is **never** committed to version control for security.

Create a `.env.local` file with the following variables:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Getting Firebase Credentials

1. **Create a Firebase Project** (if you haven't already):
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Once created, select your project

2. **Get Web App Credentials**:
   - In the Firebase Console, click the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"
   - Scroll down to "Your apps" section
   - Click the web icon (`</>`) to add a web app or select an existing one
   - Copy the configuration values to your `.env.local` file

3. **Enable Firebase Services**:
   - **Authentication**: Go to "Authentication" → "Sign-in method" → Enable "Email/Password"
   - **Firestore**: Go to "Firestore Database" → "Create database" → Choose production/test mode

### Firebase Configuration Structure

The Firebase configuration is centralized in `src/firebase/firebaseConfig.js`. This file:

- ✅ Provides idempotent initialization (safe to call multiple times)
- ✅ Uses environment variables for configuration
- ✅ Works on both web and native platforms (iOS/Android)
- ✅ Exports helper functions for common Firestore operations
- ✅ Includes fail-fast error handling with clear messages
- ✅ Provides debug logging in development mode

**Important**: All Firebase operations in the codebase **must** use the exported functions from this config file. Never initialize Firebase directly in other files.

### Usage Examples

#### Authentication

```javascript
import { getAuthInstance } from '@/src/firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Get the Auth instance
const auth = getAuthInstance();

// Sign in a user
await signInWithEmailAndPassword(auth, email, password);
```

#### Firestore - Using Helper Functions

```javascript
import { 
  fetchHelpRequestsRealTime, 
  addHelpRequest 
} from '@/src/firebase/firebaseConfig';

// Subscribe to real-time updates
const unsubscribe = fetchHelpRequestsRealTime((requests) => {
  console.log('Help requests:', requests);
}, { category: 'academic' });

// Later, unsubscribe to stop listening
unsubscribe();

// Add a new help request
const requestId = await addHelpRequest(
  {
    title: 'Need help with calculus',
    category: 'academic',
    description: 'Need tutoring for calculus exam',
    location: 'Library'
  },
  userId,
  userEmail,
  userName
);
```

#### Firestore - Direct Operations

```javascript
import { getFirestoreInstance } from '@/src/firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

// Get the Firestore instance
const db = getFirestoreInstance();

// Query a collection
const querySnapshot = await getDocs(collection(db, 'helpRequests'));
querySnapshot.forEach((doc) => {
  console.log(doc.id, doc.data());
});
```

### Available Helper Functions

The following helper functions are exported from `firebaseConfig.js`:

| Function | Description |
|----------|-------------|
| `getAuthInstance()` | Get initialized Firebase Auth (throws if config missing) |
| `getAuthIfAvailable()` | Get Auth instance or undefined (non-throwing) |
| `getFirestoreInstance()` | Get initialized Firestore (throws if config missing) |
| `getFirestoreIfAvailable()` | Get Firestore instance or undefined (non-throwing) |
| `fetchHelpRequestsRealTime(callback, options)` | Subscribe to help requests with real-time updates |
| `addHelpRequest(data, userId, userEmail, userName)` | Create a new help request |
| `fetchQuestionsRealTime(callback, options)` | Subscribe to questions with real-time updates |
| `addQuestion(data, userId, userEmail, userName)` | Create a new question |
| `testFirebaseConnection()` | Test Firebase connection and configuration |

### Testing Firebase Connection

#### Quick Configuration Check

Before running the app, you can validate your Firebase configuration:

```bash
npm run test:firebase
```

This script checks that all required environment variables are set in your `.env.local` file.

#### In-App Connection Test

To verify Firebase is working correctly within your app:

```javascript
import { testFirebaseConnection } from '@/src/firebase/firebaseConfig';

const status = await testFirebaseConnection();
console.log(status);
// {
//   success: true,
//   auth: true,
//   firestore: true,
//   message: "Firebase is properly configured and connected"
// }
```

### Firestore Security Rules

For development, you can start with test mode rules. For production, implement proper security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Help Requests - Users can read all, but only create/update their own
    match /helpRequests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Questions - Similar to help requests
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Platform Compatibility

The Firebase configuration works seamlessly across:
- ✅ **Web**: Fully supported
- ✅ **iOS**: Fully supported via Expo
- ✅ **Android**: Fully supported via Expo

### Troubleshooting Firebase

**Environment variables not loading:**
1. Ensure `.env.local` is in the project root
2. Restart the Expo development server: `npm start`
3. Clear Metro cache: `npx expo start -c`
4. Verify variable names use `EXPO_PUBLIC_` prefix

**"Firebase API key is missing" error:**
- Check that `EXPO_PUBLIC_FIREBASE_API_KEY` is set in `.env.local`
- Verify no extra spaces or quotes around the value
- Restart the development server

**Authentication errors:**
- Ensure Email/Password authentication is enabled in Firebase Console
- Check that users have verified their email addresses
- Verify Firebase credentials are correct

**Firestore permission errors:**
- Update Firestore security rules in Firebase Console
- Ensure user is authenticated before accessing Firestore
- Check that userId matches in security rules

### Security Best Practices

1. ✅ **Never commit `.env.local`** - It's in `.gitignore` for security
2. ✅ **Use environment-specific configs** - Different `.env.local` for dev/staging/prod
3. ✅ **Implement proper Firestore rules** - Never use test mode in production
4. ✅ **Enable App Check** - Protect against abuse (recommended for production)
5. ✅ **Monitor Firebase usage** - Set up billing alerts and quotas

## 💻 Development Guidelines

### Code Style

The project uses **Prettier** for code formatting and **ESLint** for linting.

#### Run Formatter
```bash
npm run format
```

#### Check Format
```bash
npm run check:format
```

#### Run Linter
```bash
npm run lint
```

#### Fix Linting Errors
```bash
npm run lint -- --fix
```

### TypeScript

All files should use TypeScript (`.tsx` for React components, `.ts` for utilities).

**Type Checking:**
```bash
tsc --noEmit
```

### Naming Conventions

- **Components**: PascalCase (e.g., `HomeScreen.tsx`)
- **Hooks**: camelCase prefixed with "use" (e.g., `useTheme.ts`)
- **Constants**: UPPER_SNAKE_CASE
- **Variables/Functions**: camelCase
- **Types/Interfaces**: PascalCase

### Component Structure

```tsx
import React from 'react';
import { View, Text } from 'react-native';

interface ComponentProps {
  title: string;
  onPress?: () => void;
}

export const MyComponent: React.FC<ComponentProps> = ({ 
  title, 
  onPress 
}) => {
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
};
```

### Theme System

Use the `useTheme` hook for consistent styling:

```tsx
import { useTheme } from '@/hooks/useTheme';

export const MyComponent = () => {
  const { colors, spacing } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      {/* Component */}
    </View>
  );
};
```

### Multi-language Support

Use the `LanguageContext` for internationalization:

```tsx
import { useContext } from 'react';
import { LanguageContext } from '@/contexts/LanguageContext';

export const MyComponent = () => {
  const { language, translate } = useContext(LanguageContext);
  
  return <Text>{translate('key')}</Text>;
};
```

### Git Workflow

1. Create feature branch:
```bash
git checkout -b feature/feature-name
```

2. Make changes and commit:
```bash
git add .
git commit -m "feat: add new feature"
```

3. Push and create PR:
```bash
git push origin feature/feature-name
```

## 🐛 Troubleshooting

### Port Already in Use

If port 8081 is already in use:

```bash
# Kill the process using the port (Linux/macOS)
lsof -ti:8081 | xargs kill -9

# Or use a different port
npx expo start --web --port 3000
```

### Clear Cache

If you experience build issues, clear cache:

```bash
# Clear all cache
rm -rf node_modules .expo dist
npm install

# Or use Expo's cache clearing
npx expo start --clear
```

### Module Not Found Errors

Update dependencies:

```bash
npm install
npx expo prebuild --clean
```

### iOS Build Issues

```bash
# Clean iOS build
rm -rf ios
npx expo prebuild --clean

# Or reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Android Build Issues

```bash
# Clean Android build
rm -rf android
npx expo prebuild --clean

# Or clear Gradle cache
cd android
./gradlew clean
cd ..
```

### QR Code Not Displaying

Ensure Metro bundler is running properly:

```bash
npx expo start --reset-cache
```

### Build Submission Failures

Check credentials and app configuration:

```bash
npx eas credentials
npx eas build:list
npx eas submit:list
```

## 🔐 Security Considerations

- Store sensitive data (API keys, tokens) in environment variables
- Use `.env` files (never commit to git)
- Add `.env` to `.gitignore`
- Implement proper authentication mechanisms
- Validate all user inputs
- Use HTTPS for all API communications
- Keep dependencies updated regularly

## 📚 Useful Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Docs](https://reactnavigation.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Expo EAS Build](https://docs.expo.dev/eas-update/build-with-eas/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console)

## 👥 Support & Contributing

For issues, questions, or contributions:

1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Fork the repository and create a pull request
4. Follow the project's code style and conventions

## 📄 License

This project is private and proprietary to METU Help.

---

**Last Updated:** December 2025
**Version:** 1.0.0
