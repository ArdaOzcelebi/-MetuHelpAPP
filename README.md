# METU Help - MetuAPP

A React Native mobile application built with Expo, designed to facilitate help requests and offers within the METU community.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
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
