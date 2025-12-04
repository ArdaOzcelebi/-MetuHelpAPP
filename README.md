# METU Help - MetuAPP

A React Native mobile application built with Expo, designed to facilitate help requests and offers within the METU community.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
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
| **Styling** | React Native native components with theme system |
| **Linting** | ESLint 9.25.0 |
| **Formatting** | Prettier 3.6.2 |
| **Build Tool** | Expo CLI |
| **Package Manager** | npm/yarn |

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** (usually comes with Node.js)
- **Git** - [Download](https://git-scm.com/)

### For iOS Development
- **macOS** (required for iOS builds)
- **Xcode** 14.0 or higher
- **CocoaPods** (for iOS dependency management)
- **Apple Developer Account** (for deployment to App Store)

### For Android Development
- **Android Studio** 4.1 or higher
- **Android SDK** (API level 24 minimum, target 34+)
- **Java Development Kit (JDK)** 11 or higher
- **Google Play Developer Account** (for deployment to Play Store)

### Recommended
- **Expo Go** mobile app (for quick testing on physical devices)
- **Visual Studio Code** with recommended extensions:
  - ESLint
  - Prettier - Code formatter
  - React Native Tools
  - TypeScript Vue Plugin (Volar)

## 🚀 Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ArdaOzcelebi/-MetuAPP.git
cd -MetuAPP
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory for environment-specific variables:

```bash
# .env (create in root directory)
EXPO_PACKAGER_PROXY_URL=https://<your-domain>
REACT_NATIVE_PACKAGER_HOSTNAME=<your-hostname>
```

### 4. Verify Installation

Check that everything is properly installed:

```bash
npm run lint
```

This should run without major errors (warnings are okay).

## 🎬 Running the Application

### Development Server

Start the Expo development server:

```bash
npm run dev
```

This command starts the Metro bundler and displays a QR code.

**For Replit environments:**
```bash
npm run dev
```

The server automatically uses Replit domain configuration.

### Running on Different Platforms

#### Web
```bash
npm run web
```
Opens the application in your browser at `http://localhost:8081`

#### iOS
Requires a macOS machine with Xcode:
```bash
npm run ios
```

You can also use Expo Go app on a physical iOS device:
1. Scan the QR code from `npm start` with your iPhone camera
2. Tap to open in Expo Go

#### Android
With Android emulator running:
```bash
npm run android
```

Or with a physical Android device:
1. Install Expo Go from Google Play Store
2. Run `npm start`
3. Scan the QR code with your Android device in Expo Go

### Manual Start with Options

```bash
npm start                    # Start dev server (interactive mode)
npx expo start --web        # Force web
npx expo start --android    # Force Android
npx expo start --ios        # Force iOS
```

## 📱 Building for Production

### Web Build

```bash
npx expo export --platform web
```

Output directory: `dist/` (configured in app.json as "single" output)

### iOS Production Build

**Requires macOS and Xcode:**

```bash
# Generate build
npx eas build --platform ios --auto-submit

# Or for local build
npx expo export --platform ios
cd ios && pod install && cd ..
xcodebuild -workspace ios/metuhelp.xcworkspace -scheme metuhelp -configuration Release
```

**Requirements:**
- Apple Developer Account membership
- Valid provisioning profiles
- Code signing certificate

### Android Production Build

```bash
# Generate build
npx eas build --platform android --auto-submit

# Or for local build
npx expo export --platform android
cd android && ./gradlew bundleRelease
```

**Requirements:**
- Keystore file for signing (saved securely)
- Google Play Developer Account

### Building All Platforms

```bash
npx eas build --platform all
```

## 🚢 Deployment

### Web Deployment

#### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow prompts to link project and deploy

#### Netlify

1. Build the project:
```bash
npx expo export --platform web
```

2. Deploy the `dist/` folder using Netlify CLI or web interface

#### Manual Deployment

1. Build for web:
```bash
npx expo export --platform web
```

2. Upload the `dist/` folder to your hosting service (AWS, GCP, Azure, etc.)

### iOS App Store Deployment

#### Using EAS (Easiest)

1. Set up EAS project:
```bash
npx eas init
```

2. Configure app credentials:
```bash
npx eas credentials
```

3. Create and submit build:
```bash
npx eas build --platform ios
npx eas submit --platform ios
```

#### Manual Deployment

1. Build archive:
```bash
cd ios
xcodebuild -workspace metuhelp.xcworkspace -scheme metuhelp -archivePath metuhelp.xcarchive -configuration Release archive
xcodebuild -exportArchive -archivePath metuhelp.xcarchive -exportOptionsPlist export.plist -exportPath .
```

2. Use Xcode Organizer to submit to App Store

**Configuration:**
- Bundle Identifier: `com.metuhelp.app`
- App Store Team ID and certificates needed
- Screenshots, description, and metadata required

### Google Play Store Deployment

#### Using EAS (Recommended)

1. Set up EAS project (if not done):
```bash
npx eas init
```

2. Configure credentials:
```bash
npx eas credentials
```

3. Build and submit:
```bash
npx eas build --platform android
npx eas submit --platform android
```

#### Manual Deployment

1. Build bundle:
```bash
cd android
./gradlew bundleRelease
```

2. Sign the bundle:
```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore my-release-key.jks app-release.aab my-key-alias
```

3. Upload via Google Play Console

**Configuration:**
- Package Name: `com.metuhelp.app`
- Play Store key must be saved and secured
- Icons, screenshots, and app description required

### Continuous Deployment (CI/CD)

#### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Build web
        run: npx expo export --platform web
      
      - name: Deploy to Vercel
        uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

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
