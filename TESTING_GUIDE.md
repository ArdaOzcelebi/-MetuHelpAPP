# Authentication Testing Guide

This document provides a comprehensive testing plan for the Firebase authentication implementation.

## Prerequisites

Before testing, ensure:
1. You have created a Firebase project and enabled Email/Password authentication
2. You have created a `.env` file with valid Firebase configuration (see FIREBASE_AUTH_SETUP.md)
3. You have run `npm install` to install all dependencies
4. The app builds successfully

## Test Plan

### 1. Environment Configuration Tests

**Test 1.1: Missing Environment Variables**
- Remove or comment out one Firebase environment variable in `.env`
- Run the app
- **Expected**: Console error message indicating which variable is missing

**Test 1.2: Valid Configuration**
- Ensure all environment variables are set correctly
- Run the app
- **Expected**: App starts without Firebase initialization errors

### 2. Registration Flow Tests

**Test 2.1: Invalid Email Format**
- Open the Register screen
- Enter email: `test@gmail.com`
- Enter password: `password123`
- Confirm password: `password123`
- Tap "Sign Up"
- **Expected**: Error message "Only @metu.edu.tr email addresses are allowed"

**Test 2.2: Valid METU Email**
- Enter email: `test@metu.edu.tr`
- Enter password: `password123`
- Confirm password: `password123`
- Tap "Sign Up"
- **Expected**: Success alert with message to check email for verification

**Test 2.3: Password Too Short**
- Enter email: `test@metu.edu.tr`
- Enter password: `pass1`
- Confirm password: `pass1`
- Tap "Sign Up"
- **Expected**: Error message "Password must be at least 8 characters long"

**Test 2.4: Password Without Digit**
- Enter email: `test@metu.edu.tr`
- Enter password: `password`
- Confirm password: `password`
- Tap "Sign Up"
- **Expected**: Error message "Password must contain at least one digit"

**Test 2.5: Passwords Don't Match**
- Enter email: `test@metu.edu.tr`
- Enter password: `password123`
- Confirm password: `password456`
- Tap "Sign Up"
- **Expected**: Error message "Passwords don't match"

**Test 2.6: Email Already Registered**
- Register with an email that's already in use
- **Expected**: Error message "This email is already registered"

**Test 2.7: Verification Email Sent**
- Successfully register a new account
- Check email inbox (and spam folder)
- **Expected**: Verification email from Firebase with verification link

### 3. Login Flow Tests

**Test 3.1: Login Without Email Verification**
- Register a new account but don't verify email
- Try to log in with the same credentials
- **Expected**: Alert "Email Not Verified" with option to resend verification email

**Test 3.2: Resend Verification Email**
- When prompted with "Email Not Verified" alert
- Tap "Resend Verification Email"
- **Expected**: Success alert and new verification email sent

**Test 3.3: Login With Verified Email**
- Verify email by clicking link in verification email
- Log in with the same credentials
- **Expected**: Successfully logged in and redirected to Home screen

**Test 3.4: Invalid Credentials**
- Enter registered email with wrong password
- **Expected**: Error message "Invalid email or password"

**Test 3.5: Non-METU Email**
- Try to log in with `test@gmail.com`
- **Expected**: Error message "Only @metu.edu.tr email addresses are allowed"

**Test 3.6: Remember Me - Enabled**
- Log in with "Remember Me" checked
- Close the app completely
- Reopen the app
- **Expected**: User remains logged in, sees Home screen

**Test 3.7: Remember Me - Disabled**
- Log out
- Log in with "Remember Me" unchecked
- Close the app completely
- Reopen the app
- **Expected**: User is logged out, sees Login screen

**Test 3.8: Show/Hide Password**
- On login screen, tap the eye icon
- **Expected**: Password becomes visible
- Tap again
- **Expected**: Password becomes hidden

### 4. Profile Screen Tests

**Test 4.1: User Information Display**
- Log in and navigate to Profile tab
- **Expected**: 
  - User's email is displayed
  - User initials shown in avatar
  - "Verified" badge shown (green checkmark)

**Test 4.2: Logout Confirmation**
- Tap "Log Out" button
- **Expected**: Alert asking "Are you sure you want to log out?"

**Test 4.3: Cancel Logout**
- Tap "Log Out" button
- Tap "Cancel" in alert
- **Expected**: Alert dismissed, user remains on Profile screen

**Test 4.4: Confirm Logout**
- Tap "Log Out" button
- Tap "Log Out" in alert
- **Expected**: User logged out and redirected to Login screen

### 5. Session Persistence Tests

**Test 5.1: Session Persists on App Restart (Remember Me ON)**
- Log in with "Remember Me" enabled
- Force quit the app
- Reopen the app
- **Expected**: User automatically logged in

**Test 5.2: Session Clears on App Restart (Remember Me OFF)**
- Log out
- Log in with "Remember Me" disabled
- Force quit the app
- Reopen the app
- **Expected**: User must log in again

**Test 5.3: Session Persists After Hot Reload (Development)**
- Log in
- Make a code change to trigger hot reload
- **Expected**: User remains logged in

### 6. Navigation Tests

**Test 6.1: Conditional Navigation - Logged Out**
- Ensure user is logged out
- Open the app
- **Expected**: See Login screen

**Test 6.2: Conditional Navigation - Logged In**
- Log in successfully
- **Expected**: See Home screen with tab navigation

**Test 6.3: Navigation Between Login/Register**
- On Login screen, tap "Sign Up" link
- **Expected**: Navigate to Register screen
- Tap "Sign In" link
- **Expected**: Navigate back to Login screen

### 7. UI/UX Tests

**Test 7.1: Loading States**
- Tap "Sign In" or "Sign Up" button
- **Expected**: Button shows loading spinner and is disabled during request

**Test 7.2: Error Message Display**
- Trigger any validation error
- **Expected**: Error message shown in red box with alert icon

**Test 7.3: Input Validation Real-time**
- Start typing in email field
- **Expected**: No validation errors shown until form submission

**Test 7.4: Theme Support**
- Switch device to dark mode
- **Expected**: All auth screens adapt to dark theme

**Test 7.5: Keyboard Behavior**
- Focus on password field
- **Expected**: Keyboard appears, form scrolls to keep input visible
- Tap "Done" or "Return"
- **Expected**: Keyboard dismisses

### 8. Multilingual Support Tests

**Test 8.1: English Translations**
- Ensure app is set to English
- Navigate through Login/Register screens
- **Expected**: All text displayed in English

**Test 8.2: Turkish Translations**
- Switch app language to Turkish
- Navigate through Login/Register screens
- **Expected**: All text displayed in Turkish

### 9. Error Handling Tests

**Test 9.1: Network Error**
- Disable internet connection
- Try to log in or register
- **Expected**: Error message "Network error. Please check your connection"

**Test 9.2: Too Many Requests**
- Make multiple failed login attempts quickly
- **Expected**: Error message about too many attempts, user locked out temporarily

**Test 9.3: Firebase Service Down**
- (Simulate by providing invalid Firebase config)
- Try to use auth features
- **Expected**: Graceful error handling with appropriate message

### 10. Security Tests

**Test 10.1: .env File Not Committed**
- Check git status
- **Expected**: `.env` file not shown in git status (should be ignored)

**Test 10.2: Secure Token Storage**
- Log in with "Remember Me"
- On native device: Check that tokens are stored in Keychain (iOS) or EncryptedSharedPreferences (Android)
- On web: Check that tokens are in localStorage
- **Expected**: Tokens stored securely for platform

**Test 10.3: Email Verification Required**
- Register but don't verify email
- Try to access authenticated features
- **Expected**: Cannot access until email is verified

## Automated Testing (Future)

Consider adding automated tests for:
- Unit tests for validation functions
- Integration tests for auth flow
- E2E tests for critical user journeys

## Reporting Issues

If you encounter issues during testing:
1. Check Firebase Console for authentication logs
2. Check browser/device console for error messages
3. Verify `.env` configuration is correct
4. Ensure Firebase Email/Password authentication is enabled

## Performance Benchmarks

Expected performance:
- Login/Register: < 2 seconds (with good network)
- Email verification: Immediate (email delivery may vary)
- Session check on app start: < 500ms
- Logout: < 100ms

## Browser/Platform Compatibility

Test on:
- iOS Simulator/Device
- Android Emulator/Device
- Web browsers (Chrome, Safari, Firefox)
- Different screen sizes (phone, tablet)

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ Smooth user experience
- ✅ Proper error messages
- ✅ Secure token storage
- ✅ Email verification working
- ✅ Remember Me working correctly
- ✅ Responsive UI on all platforms
