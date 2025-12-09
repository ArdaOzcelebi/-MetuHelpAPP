# Firebase Authentication Setup Guide

This document provides instructions for setting up and using the Firebase authentication system in the METU Help App.

## Overview

The app now includes Firebase-based email/password authentication with the following features:

- ✅ Email/password authentication
- ✅ Email verification requirement before login
- ✅ Domain restriction: Only @metu.edu.tr emails can register
- ✅ Password validation: Minimum 8 characters with at least 1 digit
- ✅ "Remember Me" functionality with secure token persistence
- ✅ Turkish and English localization support
- ✅ Secure credential storage using expo-secure-store

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install the following new dependencies:
- `firebase@^10.14.1`
- `expo-secure-store@^12.1.1`
- `@react-native-async-storage/async-storage@^1.20.1`

### 2. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Email/Password authentication:
   - Navigate to Authentication → Sign-in method
   - Enable "Email/Password" provider
   - (Optional) Enable "Email link (passwordless sign-in)" if desired

### 3. Get Firebase Configuration

1. In Firebase Console, go to Project Settings → General
2. Scroll down to "Your apps" section
3. If you haven't added an app, click "Add app" and select Web (</>) platform
4. Copy the Firebase configuration values:
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId

### 4. Configure Environment Variables

#### Option A: Using .env file (for local development)

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your Firebase credentials:
   ```env
   FIREBASE_API_KEY=your_actual_api_key
   FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

#### Option B: Using Expo Secrets (for production/CI)

Add the environment variables to your Expo project:
```bash
npx eas secret:create --scope project --name FIREBASE_API_KEY --value "your_value"
npx eas secret:create --scope project --name FIREBASE_AUTH_DOMAIN --value "your_value"
# ... repeat for all variables
```

Or configure them in your `app.json` / `app.config.js`:
```js
export default {
  expo: {
    extra: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      // ... other config
    }
  }
}
```

### 5. Run the App

```bash
npm start
# Then press 'i' for iOS or 'a' for Android
```

## Architecture

### File Structure

```
firebase/
  └── firebaseConfig.ts       # Firebase initialization with config validation

services/
  └── storage.ts              # Secure storage wrapper (SecureStore/AsyncStorage)

contexts/
  └── AuthContext.tsx         # Authentication state management

screens/Auth/
  ├── LoginScreen.tsx         # Login UI
  └── RegisterScreen.tsx      # Registration UI with email verification
```

### Authentication Flow

1. **Registration**
   - User enters email (must be @metu.edu.tr)
   - User enters password (min 8 chars, 1 digit required)
   - User checks "Remember Me" (optional)
   - Firebase creates account and sends verification email
   - User is shown verification prompt

2. **Email Verification**
   - User clicks link in verification email
   - Email is marked as verified in Firebase
   - User can now log in

3. **Login**
   - User enters credentials
   - App checks if email is verified
   - If verified, user is authenticated and can access the app
   - If not verified, user is prompted to verify or resend verification email

4. **Session Persistence**
   - If "Remember Me" is checked, session persists across app restarts
   - If not checked, user must log in again after closing the app

5. **Logout**
   - User clicks logout button in Profile screen
   - Session is cleared from secure storage
   - User is redirected to login screen

## API Reference

### useAuth Hook

Access authentication state and methods anywhere in the app:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const {
    user,              // Current Firebase user or null
    loading,           // Boolean: true while checking auth state
    signUp,            // Function to register new user
    signIn,            // Function to log in
    signOut,           // Function to log out
    sendEmailVerification,        // Function to send verification email
    resendVerificationEmail,      // Function to resend verification
    updateProfile,     // Function to update user profile
  } = useAuth();

  // ...
}
```

### Methods

#### signUp(email, password, rememberMe)
```typescript
await signUp('student@metu.edu.tr', 'Password123', true);
```
- Validates email domain (@metu.edu.tr)
- Validates password (8+ chars, 1+ digit)
- Creates Firebase account
- Sends verification email
- Throws error with user-friendly message on failure

#### signIn(email, password, rememberMe)
```typescript
await signIn('student@metu.edu.tr', 'Password123', true);
```
- Authenticates with Firebase
- Checks email verification status
- Persists session if rememberMe is true
- Throws error if email not verified

#### signOut()
```typescript
await signOut();
```
- Clears session from secure storage
- Signs out from Firebase
- Redirects to login screen

## Security Considerations

### What's Secure
- ✅ Firebase credentials stored in environment variables
- ✅ Auth tokens managed by Firebase SDK
- ✅ Session persistence uses expo-secure-store (encrypted on device)
- ✅ Email verification required before access
- ✅ Domain restriction prevents non-METU users
- ✅ Client-side validation before API calls

### What to Do
- ✅ Keep `.env` file out of version control (already in `.gitignore`)
- ✅ Use environment variables or secrets for Firebase config
- ✅ Enable Firebase security rules in Firebase Console
- ✅ Consider adding reCAPTCHA for production
- ✅ Monitor Firebase authentication logs

### What NOT to Do
- ❌ Don't commit `.env` file with real credentials
- ❌ Don't share Firebase credentials in public places
- ❌ Don't disable email verification requirement
- ❌ Don't remove domain restriction (@metu.edu.tr)

## Troubleshooting

### "Firebase configuration error" in console
- Make sure all environment variables are set in `.env`
- Check that values don't contain `your_` or `_here` placeholders
- Verify Firebase project exists and is properly configured

### "Email not verified" error on login
- User must click the verification link in their email
- Check spam folder for verification email
- Use "Resend Verification Email" option in the app

### "Only @metu.edu.tr emails are allowed"
- This is intentional - only METU emails can register
- Contact admin if you need to whitelist other domains

### Session doesn't persist
- Make sure "Remember Me" was checked during login
- Check that expo-secure-store is properly installed
- On web, AsyncStorage is used as fallback

### Password validation fails
- Password must be at least 8 characters
- Password must contain at least 1 digit (0-9)

## Testing

### Manual Testing Checklist

- [ ] Register with non-METU email → Should fail
- [ ] Register with weak password → Should fail
- [ ] Register with valid credentials → Should succeed
- [ ] Receive verification email
- [ ] Try to login before verifying → Should fail
- [ ] Verify email via link
- [ ] Login with verified account → Should succeed
- [ ] Check "Remember Me" and restart app → Should stay logged in
- [ ] Don't check "Remember Me" and restart app → Should require login
- [ ] Logout → Should return to login screen
- [ ] Profile screen shows user email and verification badge

## Customization

### Changing Email Domain Restriction

Edit `contexts/AuthContext.tsx`:
```typescript
const validateEmail = (email: string): void => {
  if (!email.endsWith("@yourdomain.com")) {
    throw new Error("Only @yourdomain.com emails are allowed to register");
  }
};
```

### Changing Password Requirements

Edit `contexts/AuthContext.tsx`:
```typescript
const validatePassword = (password: string): void => {
  if (password.length < 12) {  // Changed from 8 to 12
    throw new Error("Password must be at least 12 characters long");
  }
  // Add more validation rules as needed
};
```

## Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Expo SecureStore Docs](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [React Navigation Auth Flow](https://reactnavigation.org/docs/auth-flow)

## Support

For issues or questions:
1. Check Firebase Console for authentication logs
2. Check app console for error messages
3. Verify all environment variables are set correctly
4. Review this documentation
