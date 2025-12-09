# Firebase Authentication Setup Guide

This document explains how to configure and use the Firebase authentication system in the METU Help app.

## Prerequisites

Before running the app, you need to:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password authentication in Firebase Console
3. Get your Firebase configuration values

## Configuration

### Step 1: Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Navigate to **Build** > **Authentication**
4. Click **Get Started** and enable **Email/Password** sign-in method

### Step 2: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. If you haven't added an app yet, click **Add app** and select your platform
4. Copy your Firebase configuration values

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory of the project:

```bash
cp .env.example .env
```

Edit the `.env` file and replace the placeholder values with your actual Firebase configuration:

```env
FIREBASE_API_KEY=your_actual_api_key_here
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
FIREBASE_APP_ID=your_actual_app_id
```

**IMPORTANT**: Never commit the `.env` file to version control. It's already included in `.gitignore`.

## Features

### Email Validation
- Only `@metu.edu.tr` email addresses are allowed to register
- Email format is validated client-side

### Password Requirements
- Minimum 8 characters
- Must contain at least one digit
- All requirements are validated client-side before submission

### Email Verification
- Users must verify their email address before they can log in
- Verification emails are sent automatically upon registration
- Users can resend verification emails if needed
- Login is blocked until email is verified

### Remember Me
- Users can choose to stay signed in across app restarts
- Session tokens are stored securely using:
  - `expo-secure-store` on iOS and Android
  - `AsyncStorage` on web (fallback)

### Authentication Flow

1. **Registration**:
   - User enters @metu.edu.tr email and password
   - Account is created in Firebase
   - Verification email is sent automatically
   - User is redirected to login screen

2. **Login**:
   - User enters email and password
   - App checks if email is verified
   - If verified, user is logged in
   - If not verified, user can resend verification email

3. **Session Management**:
   - If "Remember Me" is checked, session persists across app restarts
   - If not checked, user must log in again after closing the app

4. **Logout**:
   - User can log out from the Profile screen
   - Session is cleared from secure storage
   - User is redirected to login screen

## File Structure

```
├── .env.example                          # Environment variables template
├── src/
│   ├── firebase/
│   │   └── firebaseConfig.ts            # Firebase initialization
│   ├── services/
│   │   └── storage.ts                   # Secure storage service
│   └── contexts/
│       └── AuthContext.tsx              # Authentication context and hooks
├── screens/
│   └── Auth/
│       ├── LoginScreen.tsx              # Login screen
│       └── RegisterScreen.tsx           # Registration screen
├── navigation/
│   └── AuthStackNavigator.tsx           # Auth navigation stack
└── App.tsx                              # Root component with auth integration

```

## Usage in Components

### Using the Auth Context

```typescript
import { useAuth } from '@/src/contexts/AuthContext';

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      {user ? (
        <>
          <Text>Welcome, {user.email}</Text>
          <Button onPress={signOut}>Log Out</Button>
        </>
      ) : (
        <Text>Please log in</Text>
      )}
    </View>
  );
}
```

### Available Auth Methods

- `user`: Current Firebase user object or `null`
- `loading`: Boolean indicating if auth state is loading
- `signUp(email, password, rememberMe)`: Create new account
- `signIn(email, password, rememberMe)`: Sign in existing user
- `signOut()`: Sign out current user
- `sendEmailVerification()`: Send verification email to current user
- `resendVerificationEmail()`: Resend verification email
- `updateProfile(displayName)`: Update user's display name

## Error Handling

The authentication system provides user-friendly error messages for common scenarios:

- Invalid email format
- Non-METU email addresses
- Password too short
- Password missing digit
- Passwords don't match
- Email already in use
- Invalid credentials
- Email not verified
- Network errors
- Too many failed attempts

## Security Considerations

1. **Never commit `.env` file**: Contains sensitive Firebase configuration
2. **Secure token storage**: Uses platform-specific secure storage
3. **Email verification required**: Prevents fake account creation
4. **Client-side validation**: Provides immediate feedback to users
5. **Firebase Security Rules**: Configure in Firebase Console to protect data

## Troubleshooting

### Issue: "Firebase not initialized" error
**Solution**: Make sure you've created the `.env` file with valid Firebase configuration.

### Issue: Verification email not received
**Solutions**:
- Check spam folder
- Verify email address is correct
- Wait a few minutes (email delivery can be delayed)
- Use the "Resend Verification Email" option

### Issue: Can't log in after verification
**Solution**: Make sure you clicked the verification link in the email. Try signing out and signing in again.

### Issue: Remember Me not working
**Solution**: 
- On web, check browser settings allow localStorage
- On mobile, ensure app has proper permissions

## Development Notes

- The app uses conditional navigation based on authentication state
- When logged in, users see the main tab navigator
- When logged out, users see the authentication screens
- Authentication state is managed globally via React Context
- All auth screens follow the app's design guidelines and theme system

## Dependencies

- `firebase@^10.13.0`: Firebase SDK
- `@react-native-async-storage/async-storage@^1.20.1`: Storage for web fallback
- `expo-secure-store@^12.1.1`: Secure storage for native platforms

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Expo SecureStore Documentation](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [React Navigation Authentication Flow](https://reactnavigation.org/docs/auth-flow)
