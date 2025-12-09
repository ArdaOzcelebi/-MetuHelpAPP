# Copilot Instructions for METU Help App

## Project Overview

METU Help is a React Native mobile application built with Expo, designed to facilitate help requests and offers within the METU (Middle East Technical University) community. The app connects students and staff to help each other through various features including posting help requests, offering assistance, and asking questions.

## Tech Stack

- **Framework**: React Native 0.81.5 with Expo 54.0.23
- **Language**: TypeScript 5.9.2
- **Navigation**: React Navigation 7.x (Bottom Tabs & Native Stack)
- **Styling**: React Native native components with custom theme system
- **Linting**: ESLint 9.25.0 with Prettier 3.6.2
- **Package Manager**: npm

## Project Structure

```
├── components/          # Reusable UI components (Button, Card, ThemedText, etc.)
├── screens/            # Screen components (HomeScreen, BrowseScreen, etc.)
├── navigation/         # Navigation configuration (Tab & Stack navigators)
├── contexts/           # React Context for state management (LanguageContext)
├── hooks/              # Custom React hooks (useTheme, useColorScheme, etc.)
├── constants/          # Application constants (theme.ts)
├── assets/             # Static assets (images)
├── scripts/            # Build and utility scripts
└── App.tsx             # Root component
```

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

4. **Import Aliases**: Use `@/` alias for absolute imports:
   ```tsx
   import { useTheme } from '@/hooks/useTheme';
   import { LanguageContext } from '@/contexts/LanguageContext';
   ```

### Theme System

Always use the `useTheme` hook for consistent styling:

```tsx
import { useTheme } from '@/hooks/useTheme';

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
import { useContext } from 'react';
import { LanguageContext } from '@/contexts/LanguageContext';

export const MyComponent = () => {
  const { language, translate } = useContext(LanguageContext);
  
  return <Text>{translate('key')}</Text>;
};
```

Supported languages: Turkish and English

### Screen Components

1. **Safe Area Handling**: Use `useScreenInsets` hook for proper safe area handling:
   ```tsx
   import { useScreenInsets } from '@/hooks/useScreenInsets';
   
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

## Testing

Currently, the project uses ESLint for code quality. When adding new features:
1. Ensure TypeScript types are properly defined
2. Run linter to catch potential issues
3. Test on multiple platforms (iOS, Android, Web) when possible

## Common Patterns

### Creating a New Screen

1. Create component file in `screens/`:
   ```tsx
   import React from 'react';
   import { ScreenScrollView } from '@/components/ScreenScrollView';
   import { ThemedText } from '@/components/ThemedText';
   import { useTheme } from '@/hooks/useTheme';

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
   import React from 'react';
   import { TouchableOpacity, Text, StyleSheet } from 'react-native';
   import { useTheme } from '@/hooks/useTheme';

   interface ButtonProps {
     title: string;
     onPress: () => void;
     variant?: 'primary' | 'secondary';
   }

   export const Button: React.FC<ButtonProps> = ({ 
     title, 
     onPress, 
     variant = 'primary' 
   }) => {
     const { colors } = useTheme();
     
     return (
       <TouchableOpacity
         style={[
           styles.button,
           { backgroundColor: variant === 'primary' ? colors.primary : colors.secondary }
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
       alignItems: 'center',
     },
     text: {
       color: '#FFFFFF',
       fontSize: 16,
       fontWeight: '600',
     },
   });
   ```

### Creating a Custom Hook

1. Create hook in `hooks/`:
   ```tsx
   import { useState, useEffect } from 'react';

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

## Security Considerations

- Store sensitive data in environment variables
- Never commit API keys or tokens
- Use HTTPS for all API communications
- Validate all user inputs
- Keep dependencies updated regularly

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
