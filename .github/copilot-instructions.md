# Copilot Instructions for METU Help App

## Project Overview

METU Help is a React Native mobile application built with Expo, designed to facilitate help requests and offers within the METU (Middle East Technical University) community. The app connects students and staff to help each other through various features including posting help requests, offering assistance, and asking questions.

## Tech Stack

- **Framework**: React Native 0.81.5 with Expo 54.0.23
- **Language**: TypeScript 5.9.2
- **Navigation**: React Navigation 7.x (Bottom Tabs & Native Stack)
- **Backend**: Firebase (Authentication + Firestore)
- **Styling**: React Native native components with custom theme system
- **Linting**: ESLint 9.25.0 with Prettier 3.6.2
- **Package Manager**: npm

## Project Structure

```
├── components/          # Reusable UI components (Button, Card, ThemedText, etc.)
├── screens/            # Screen components (HomeScreen, BrowseScreen, etc.)
├── navigation/         # Navigation configuration (Tab & Stack navigators)
├── contexts/           # UI-related contexts (LanguageContext for i18n)
├── hooks/              # Custom React hooks (useTheme, useColorScheme, etc.)
├── constants/          # Application constants (theme.ts)
├── src/                # Source code directory
│   ├── firebase/       # Firebase configuration (firebaseConfig.js + .d.ts)
│   ├── contexts/       # Backend-related contexts (AuthContext)
│   ├── services/       # API services (helpRequestService)
│   └── types/          # TypeScript type definitions
├── assets/             # Static assets (images)
├── scripts/            # Build and utility scripts
└── App.tsx             # Root component
```

**Note:** The project has two context directories:

- `/contexts/` - For UI and presentation layer contexts (language, theme)
- `/src/contexts/` - For backend and business logic contexts (authentication)

## Development Guidelines

### Code Style & Conventions

1. **TypeScript Required**: All files must use TypeScript (`.tsx` for React components, `.ts` for utilities)

2. **Naming Conventions**:
   - Components: PascalCase (e.g., `HomeScreen.tsx`, `ThemedButton.tsx`)
   - Hooks: camelCase with "use" prefix (e.g., `useTheme.ts`, `useColorScheme.ts`)
   - Constants: UPPER_SNAKE_CASE
   - Variables/Functions: camelCase
   - Types/Interfaces: PascalCase

3. **Component Structure**: Follow this pattern:

   ```tsx
   import React from "react";
   import { View, Text } from "react-native";

   interface ComponentProps {
     title: string;
     onPress?: () => void;
   }

   export const MyComponent: React.FC<ComponentProps> = ({
     title,
     onPress,
   }) => {
     return (
       <View>
         <Text>{title}</Text>
       </View>
     );
   };
   ```

4. **Import Aliases**: Use `@/` alias for absolute imports:
   ```tsx
   import { useTheme } from "@/hooks/useTheme";
   import { LanguageContext } from "@/contexts/LanguageContext";
   ```

### Theme System

Always use the `useTheme` hook for consistent styling:

```tsx
import { useTheme } from "@/hooks/useTheme";

export const MyComponent = () => {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background, padding: spacing.md }}>
      {/* Component content */}
    </View>
  );
};
```

**Available spacing values**:

- `spacing.xs`: 4pt
- `spacing.sm`: 8pt
- `spacing.md`: 16pt
- `spacing.lg`: 24pt
- `spacing.xl`: 32pt
- `spacing.xxl`: 48pt

**Color palette**:

- Primary: METU Maroon (#800000)
- Background: White/Off-white (#FFFFFF / #FAFAFA)
- Text: Dark Gray (#1A1A1A)
- Action Green: #10B981 (success states, CTAs)
- Alert Red: #DC2626 (errors, urgent)
- Light Gray: #E5E5E5 (borders, inactive)

### Multi-language Support

Use `LanguageContext` for internationalization:

```tsx
import { useContext } from "react";
import { LanguageContext } from "@/contexts/LanguageContext";

export const MyComponent = () => {
  const { language, translate } = useContext(LanguageContext);

  return <Text>{translate("key")}</Text>;
};
```

Supported languages: Turkish and English

## Firebase Integration

### Firebase Configuration

The app uses Firebase for authentication and Firestore for data storage. All Firebase operations **MUST** use the centralized configuration from `src/firebase/firebaseConfig.js`.

**Note:** The Firebase config uses JavaScript (`.js`) with TypeScript definitions (`.d.ts`) to ensure compatibility across all Expo platforms (web, iOS, Android).

**Environment Variables Required:**

- Copy `.env.example` to `.env.local` (never commit `.env.local`)
- Set all `EXPO_PUBLIC_FIREBASE_*` variables
- Test configuration: `npm run test:firebase`

**Usage Pattern:**

```tsx
import {
  getAuthInstance,
  getFirestoreInstance,
} from "@/src/firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

// Get Firebase instances
const auth = getAuthInstance();
const db = getFirestoreInstance();

// Use Firebase services
await signInWithEmailAndPassword(auth, email, password);
```

**Helper Functions Available:**

- `fetchHelpRequestsRealTime(callback, options)` - Subscribe to help requests with real-time updates
- `addHelpRequest(data, userId, userEmail, userName)` - Create new help request
- `fetchQuestionsRealTime(callback, options)` - Subscribe to questions
- `addQuestion(data, userId, userEmail, userName)` - Create new question
- `testFirebaseConnection()` - Test Firebase connection

**Important Rules:**

1. Never initialize Firebase directly in other files
2. Always use `getAuthInstance()` or `getFirestoreInstance()`
3. Use helper functions for common Firestore operations
4. Unsubscribe from real-time listeners when component unmounts

### Authentication Context

Use `AuthContext` from `@/src/contexts/AuthContext` for authentication state:

```tsx
import { useAuth } from "@/src/contexts/AuthContext";

export const MyComponent = () => {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;

  return <AuthenticatedContent />;
};
```

### Screen Components

1. **Safe Area Handling**: Use `useScreenInsets` hook for proper safe area handling:

   ```tsx
   import { useScreenInsets } from "@/hooks/useScreenInsets";

   const insets = useScreenInsets();
   // Apply insets for proper spacing around notches and tab bars
   ```

2. **Scrollable Screens**: Use provided wrapper components:
   - `ScreenScrollView` for scrollable content
   - `ScreenKeyboardAwareScrollView` for forms with inputs
   - `ScreenFlatList` for lists

3. **Themed Components**: Prefer themed components over raw React Native components:
   - `ThemedView` instead of `View`
   - `ThemedText` instead of `Text`

### Navigation

The app uses a tab-based navigation structure:

- **Home Tab**: Dashboard with "Need Help" and "Offer Help" CTAs
- **Browse Tab**: Browse requests and Q&A forum
- **Profile Tab**: User settings and account management

When adding new screens:

1. Create the screen component in `screens/` directory
2. Add to appropriate navigator in `navigation/` directory
3. Use `screenOptions.ts` for consistent header styling

### Visual Feedback

- **Touch Targets**: Minimum 44x44pt (iOS HIG requirement)
- **Button Animations**: Scale to 98% on press with 150ms duration
- **Large CTAs**: Opacity change to 0.9 on press
- **Cards**: Background color change (#F5F5F5) on press
- **Floating Buttons**: Shadow with offset {width: 0, height: 2}, opacity: 0.10, radius: 2

### Icons

Use Feather icons from `@expo/vector-icons`:

- Medical: 'activity'
- Academic: 'book'
- Transport: 'navigation'
- Other: 'help-circle'

**NO EMOJIS** - Use system icons exclusively.

### Accessibility

- Support Dynamic Type (text scaling)
- VoiceOver/TalkBack optimized labels
- High contrast mode support
- Minimum 4.5:1 contrast ratio for text
- Clear visual states for all interactive elements

## Linting & Formatting

**Before committing**:

1. Run formatter: `npm run format`
2. Check formatting: `npm run check:format`
3. Run linter: `npm run lint`
4. Fix linting errors: `npm run lint -- --fix`

**Type checking**:

```bash
tsc --noEmit
```

**Common ESLint Issues:**

- Avoid using `any` type - always define proper TypeScript interfaces
- Escape special characters in JSX text (use `&apos;` for apostrophes)
- Don't dynamically access environment variables (use `process.env.EXPO_PUBLIC_*` directly)
- Avoid duplicate imports from the same module

## Testing

Currently, the project uses ESLint for code quality. When adding new features:

1. Ensure TypeScript types are properly defined
2. Run linter to catch potential issues
3. Test on multiple platforms (iOS, Android, Web) when possible

**Available Test Commands:**

- `npm run test:firebase` - Validate Firebase configuration
- `npm run lint` - Run ESLint
- `npm run check:format` - Check code formatting
- `tsc --noEmit` - TypeScript type checking

## Common Patterns

### Creating a New Screen

1. Create component file in `screens/`:

   ```tsx
   import React from "react";
   import { ScreenScrollView } from "@/components/ScreenScrollView";
   import { ThemedText } from "@/components/ThemedText";
   import { useTheme } from "@/hooks/useTheme";

   export const NewScreen = () => {
     const { colors, spacing } = useTheme();

     return (
       <ScreenScrollView>
         <ThemedText>Screen Content</ThemedText>
       </ScreenScrollView>
     );
   };
   ```

2. Add to navigator in `navigation/`

### Creating a Reusable Component

1. Create component in `components/`:

   ```tsx
   import React from "react";
   import { TouchableOpacity, Text, StyleSheet } from "react-native";
   import { useTheme } from "@/hooks/useTheme";

   interface ButtonProps {
     title: string;
     onPress: () => void;
     variant?: "primary" | "secondary";
   }

   export const Button: React.FC<ButtonProps> = ({
     title,
     onPress,
     variant = "primary",
   }) => {
     const { colors } = useTheme();

     return (
       <TouchableOpacity
         style={[
           styles.button,
           {
             backgroundColor:
               variant === "primary" ? colors.primary : colors.secondary,
           },
         ]}
         onPress={onPress}
       >
         <Text style={styles.text}>{title}</Text>
       </TouchableOpacity>
     );
   };

   const styles = StyleSheet.create({
     button: {
       padding: 16,
       borderRadius: 8,
       alignItems: "center",
     },
     text: {
       color: "#FFFFFF",
       fontSize: 16,
       fontWeight: "600",
     },
   });
   ```

### Creating a Custom Hook

1. Create hook in `hooks/`:

   ```tsx
   import { useState, useEffect } from "react";

   export const useCustomHook = (initialValue: string) => {
     const [value, setValue] = useState(initialValue);

     useEffect(() => {
       // Hook logic
     }, []);

     return { value, setValue };
   };
   ```

## Important Notes

1. **No Direct Styling in Screens**: Always use the theme system and spacing constants
2. **Consistent Component Usage**: Use themed components (`ThemedView`, `ThemedText`) for automatic theme support
3. **Safe Area Awareness**: Always account for safe areas, especially around tab bars and headers
4. **Cross-platform Compatibility**: Test changes work on iOS, Android, and Web
5. **Type Safety**: Never use `any` type; always define proper TypeScript interfaces
6. **Performance**: Use React.memo() for components that receive stable props
7. **Error Boundaries**: Wrap components that might fail with ErrorBoundary component
8. **Firebase Usage**: Always use centralized Firebase config from `@/src/firebase/firebaseConfig`
9. **Authentication**: Use `AuthContext` for all authentication-related functionality
10. **Real-time Listeners**: Always unsubscribe from Firestore listeners in cleanup functions

## Security Considerations

- Store sensitive data in environment variables (use `.env.local` with `EXPO_PUBLIC_` prefix)
- Never commit API keys or tokens (`.env.local` is in `.gitignore`)
- Use HTTPS for all API communications
- Validate all user inputs
- Keep dependencies updated regularly
- Firebase API keys are safe to expose (security comes from Firestore rules)
- Always implement proper Firestore security rules in Firebase Console
- Use Firebase Auth for authentication (never roll your own auth)

## Environment Setup

**First Time Setup:**

1. Install dependencies: `npm install`
2. Copy environment template: `cp .env.example .env.local`
3. Add Firebase credentials to `.env.local` (all `EXPO_PUBLIC_FIREBASE_*` variables are safe for client-side code)
4. Test Firebase configuration: `npm run test:firebase`
5. Start development server: `npm start`

**Firebase Setup:**

- Get credentials from [Firebase Console](https://console.firebase.google.com/)
- Enable Email/Password authentication
- Set up Firestore database
- Configure Firestore security rules (this is where actual security is enforced)
- See README.md for detailed Firebase setup instructions

**Security Note:** All `EXPO_PUBLIC_FIREBASE_*` credentials are safe to include in `.env.local` as they're designed for client-side use. Security is enforced through Firebase Authentication and Firestore security rules, not by hiding these configuration values.

## Build & Deploy

The project uses Expo for builds:

- Development: `npm start` or `npm run dev`
- iOS: `npm run ios`
- Android: `npm run android`
- Web: `npm run web`

## Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation Docs](https://reactnavigation.org/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

## Questions?

When implementing features, always:

1. Check existing components for reusability
2. Follow established patterns in the codebase
3. Maintain consistency with design guidelines
4. Ensure accessibility requirements are met
5. Test across multiple platforms when possible

## Troubleshooting

### Firebase Issues

**"Firebase API key is missing" error:**

1. Ensure `.env.local` exists in project root
2. Check all variables use `EXPO_PUBLIC_` prefix
3. Restart Expo dev server: `npm start`
4. Clear cache: `npx expo start -c`

**Authentication errors:**

1. Verify Email/Password auth is enabled in Firebase Console
2. Check Firebase credentials are correct in `.env.local`
3. Test connection: `npm run test:firebase`

**Firestore permission errors:**

1. Update Firestore security rules in Firebase Console
2. Ensure user is authenticated before accessing Firestore
3. Check that userId matches in security rules

### Development Issues

**Port already in use:**

```bash
# Kill the process using port 8081 (Linux/macOS)
lsof -ti:8081 | xargs kill -9

# Or use a different port
npx expo start --web --port 3000
```

**Module not found errors:**

```bash
npm install
npx expo prebuild --clean
```

**Clear all caches:**

```bash
rm -rf node_modules .expo dist
npm install
npx expo start --clear
```

**ESLint/Prettier conflicts:**

```bash
npm run format
npm run lint -- --fix
```

### Platform-Specific Issues

**iOS build issues:**

```bash
rm -rf ios
npx expo prebuild --clean
```

**Android build issues:**

```bash
rm -rf android
npx expo prebuild --clean
```

**Web build issues:**

- Clear browser cache
- Check console for errors
- Ensure all polyfills are loaded

## Additional Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation Docs](https://reactnavigation.org/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Firebase Web Docs](https://firebase.google.com/docs/web/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Design Guidelines](../design_guidelines.md) - METU-specific design system
- [Firebase Implementation](../FIREBASE_IMPLEMENTATION_SUMMARY.md) - Detailed Firebase setup guide
