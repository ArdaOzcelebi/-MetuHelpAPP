# METU Help - Campus Mutual Aid App

## Overview
METU Help is a peer-to-peer mutual aid mobile application prototype designed to facilitate instant help and guidance within the METU (Middle East Technical University) campus community. The app enables students to quickly request or offer help with everyday needs and academic questions.

## Current State
- **Phase**: Frontend Prototype Complete
- **Stack**: Expo React Native (SDK 54)
- **Platform**: iOS, Android, Web via Expo Go

## Features Implemented

### 1. Home Dashboard
- Two large hero buttons: "NEED HELP" and "OFFER HELP"
- Stats showing active requests and help given today
- METU branding with maroon (#800000) color scheme

### 2. Aid/Sharing (Need Help)
- Browse active help requests with category filters
- Filter by: All, Medical, Academic, Transport, Other
- Request cards with urgency indicators
- "I Can Help" quick action buttons
- Post new need with category, location, and urgency toggle

### 3. Academic Q&A (Offer Help)
- Searchable question feed
- Filter by: Recent, Unanswered, Popular
- Category tags: Classes, Professors, Campus Life
- Response count and upvote system
- Ask new questions with tips

### 4. Browse Screen
- Combined view of needs and questions
- Tab switching between Needs and Questions
- Search functionality across all content

### 5. Profile Screen
- User avatar and statistics
- Notification preferences (push, email)
- About, Privacy Policy, Terms of Service links
- Logout functionality

## Project Architecture

```
/
├── App.tsx                 # Root component with providers
├── app.json               # Expo configuration
├── components/            # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── ErrorBoundary.tsx
│   ├── ErrorFallback.tsx
│   ├── HeaderTitle.tsx
│   ├── ScreenScrollView.tsx
│   ├── ScreenKeyboardAwareScrollView.tsx
│   ├── ScreenFlatList.tsx
│   ├── Spacer.tsx
│   ├── ThemedText.tsx
│   └── ThemedView.tsx
├── constants/
│   └── theme.ts           # METU colors, spacing, typography
├── hooks/
│   ├── useColorScheme.ts
│   ├── useScreenInsets.ts
│   └── useTheme.ts
├── navigation/
│   ├── MainTabNavigator.tsx
│   ├── HomeStackNavigator.tsx
│   ├── BrowseStackNavigator.tsx
│   ├── ProfileStackNavigator.tsx
│   └── screenOptions.ts
├── screens/
│   ├── HomeScreen.tsx
│   ├── NeedHelpScreen.tsx
│   ├── OfferHelpScreen.tsx
│   ├── RequestDetailScreen.tsx
│   ├── PostNeedScreen.tsx
│   ├── BrowseScreen.tsx
│   ├── QuestionDetailScreen.tsx
│   ├── AskQuestionScreen.tsx
│   └── ProfileScreen.tsx
└── assets/
    └── images/
        ├── icon.png
        ├── splash-icon.png
        └── favicon.png
```

## Design System

### Colors
- **Primary Maroon**: #800000 (METU brand)
- **Action Green**: #10B981 (CTAs, success)
- **Alert Red**: #DC2626 (urgent, errors)
- **Dark Mode Support**: Automatic with lighter maroon tones

### Typography
- H1-H4 headings with system fonts
- Body text: 16px
- Small/Caption: 12-14px

### Spacing
- Uses consistent spacing scale (xs to 6xl)
- Touch targets: minimum 44x44pt

## User Preferences
- Clean, accessible interface
- Bilingual support (Turkish subtitles)
- High contrast for accessibility
- Large touch targets for easy interaction

## Recent Changes
- 2024-12-04: Initial prototype created
- 2024-12-04: Implemented all core screens and navigation
- 2024-12-04: Added METU branding and color scheme
- 2024-12-04: Generated app icon with maroon theme

## Testing
- Run via Expo Go on physical devices
- Web version available for quick testing
- Scan QR code from Replit URL bar menu

## Next Steps (Future Development)
- Backend API integration for real data persistence
- User authentication (METU SSO integration)
- Real-time notifications
- Location-based request filtering
- Image attachments for requests
- User reputation system
