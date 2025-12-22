# Authentication System Testing Guide

This guide provides step-by-step instructions for testing the newly implemented Firebase Authentication system.

## Prerequisites

Before testing, ensure:
1. Firebase project is set up and Email/Password authentication is enabled
2. `.env` file is configured with valid Firebase credentials
3. App is running (`npm start`)

## Test Scenarios

### 1. New User Registration Flow

**Objective**: Verify that new users can register and receive verification emails.

**Steps**:
1. Open the app (you should see the Login screen)
2. Click "Sign Up" to navigate to the Register screen
3. Enter a valid @metu.edu.tr email address (e.g., `test@metu.edu.tr`)
4. Enter a password that meets requirements (at least 8 characters with 1 digit)
5. Confirm the password (must match)
6. Click "Sign Up" button

**Expected Results**:
- ✅ Account is created in Firebase
- ✅ Verification email is sent immediately
- ✅ Alert appears: "Registration Successful! Please check your email and click the verification link to complete your registration."
- ✅ User is redirected to Login screen
- ✅ User is NOT logged in automatically

**Error Cases to Test**:
- Try registering with email already in use → Should show: "This email address is already registered..."
- Try registering with weak password → Should show: "Password is too weak..."
- Try registering with non-METU email → Should show validation error
- Try registering with mismatched passwords → Should show: "Passwords don't match"

---

### 2. Login with Unverified Email

**Objective**: Verify that users cannot log in before verifying their email.

**Steps**:
1. On the Login screen, enter the email you just registered
2. Enter the password
3. Click "Sign In" button

**Expected Results**:
- ✅ Login attempt is blocked
- ✅ Alert appears: "Email Not Verified - Please verify your email address before signing in. Check your inbox for the verification link."
- ✅ Alert has two buttons: "Cancel" and "Resend Verification Email"
- ✅ User remains on Login screen
- ✅ User is NOT logged into the app

---

### 3. Resend Verification Email

**Objective**: Verify that users can resend verification emails.

**Steps**:
1. After failed login with unverified email (see Test 2)
2. In the alert, click "Resend Verification Email"

**Expected Results**:
- ✅ New verification email is sent
- ✅ Success alert appears: "Success - Verification Email Sent"
- ✅ Check email inbox - should receive new verification email
- ✅ User remains signed out

**Error Cases to Test**:
- Try resending with wrong password → Should show: "Invalid email or password..."
- Try resending with already verified email → Should show: "Your email is already verified..."

---

### 4. Email Verification via Email Link

**Objective**: Verify the email verification process.

**Steps**:
1. Open the verification email sent by Firebase
2. Click the verification link in the email

**Expected Results**:
- ✅ Browser opens with Firebase confirmation page
- ✅ Email is marked as verified in Firebase Console
- ✅ User can now log in successfully

**Note**: This step happens outside the app in a web browser.

---

### 5. Login with Verified Email

**Objective**: Verify that users with verified emails can log in successfully.

**Steps**:
1. After verifying email (see Test 4)
2. Return to the app
3. Enter your email and password
4. Click "Sign In" button

**Expected Results**:
- ✅ Login succeeds
- ✅ User is navigated to the main app (Home screen with tabs)
- ✅ No error alerts appear
- ✅ User can access all app features

---

### 6. Error Handling Tests

**Objective**: Verify that error messages are user-friendly.

**Test Cases**:

#### 6a. Wrong Password
1. Try to log in with correct email but wrong password
2. **Expected**: "Incorrect password. Please try again."

#### 6b. Non-existent Email
1. Try to log in with an email that doesn't exist
2. **Expected**: "No account found with this email address."

#### 6c. Too Many Login Attempts
1. Try to log in with wrong password 5+ times
2. **Expected**: "Too many failed login attempts. Please try again later or reset your password."

#### 6d. Network Error
1. Disconnect from internet
2. Try to log in
3. **Expected**: "Network error. Please check your internet connection and try again."

#### 6e. Email Already in Use
1. Try to register with an email that's already registered
2. **Expected**: "This email address is already registered. Please sign in or use a different email."

---

### 7. Remember Me Functionality

**Objective**: Verify that the Remember Me feature works.

**Steps**:
1. On Login screen, check the "Remember Me" checkbox
2. Log in successfully
3. Close the app completely
4. Reopen the app

**Expected Results**:
- ✅ User remains logged in
- ✅ User sees the main app screen (not the login screen)

**Note**: This feature is handled automatically by Firebase Auth.

---

### 8. Logout Flow

**Objective**: Verify that users can log out successfully.

**Steps**:
1. When logged in, navigate to Profile tab
2. Scroll down and click "Log Out"
3. Confirm logout in the alert dialog

**Expected Results**:
- ✅ User is logged out
- ✅ User is navigated to Login screen
- ✅ User cannot access main app features

---

## Firebase Console Verification

After testing, verify in Firebase Console:

1. **Authentication > Users**:
   - New user account should be visible
   - Email should show as "verified" after verification

2. **Authentication > Sign-in method**:
   - Email/Password should be enabled
   - No errors should be shown

3. **Authentication > Templates**:
   - Check that email verification template is configured

---

## Known Issues / Limitations

1. **Email Delivery Delay**: Firebase verification emails may take a few minutes to arrive. Check spam folder if not received.

2. **Web Testing**: When testing on web platform, email verification links open in the same tab. On mobile, they open in browser.

3. **Demo Mode**: If Firebase is not configured, the app shows a warning banner and authentication will not work.

---

## Debugging Tips

### Issue: Verification Email Not Received
**Solutions**:
- Check spam/junk folder
- Verify email address is correct
- Wait a few minutes (email delivery can be delayed)
- Try resending verification email
- Check Firebase Console for error logs

### Issue: Login Fails After Verification
**Solutions**:
- Sign out completely and try again
- Verify that email shows as verified in Firebase Console
- Try resending verification email
- Clear app cache and restart

### Issue: "Firebase not initialized" Error
**Solutions**:
- Check `.env` file exists and has correct values
- Verify environment variables start with `EXPO_PUBLIC_`
- Restart development server after changing `.env`
- Check Firebase Console project settings

---

## Test Checklist

Use this checklist to ensure all features are tested:

### Registration
- [ ] Can register with valid @metu.edu.tr email
- [ ] Verification email is sent immediately
- [ ] User is redirected to login screen after registration
- [ ] User is not logged in automatically
- [ ] Error: Email already in use
- [ ] Error: Weak password
- [ ] Error: Password mismatch

### Login (Unverified)
- [ ] Login is blocked if email not verified
- [ ] Alert shows with verification message
- [ ] Can resend verification email from alert
- [ ] User remains signed out

### Email Verification
- [ ] Verification email received
- [ ] Clicking link verifies email
- [ ] Email shows as verified in Firebase Console

### Login (Verified)
- [ ] Login succeeds with verified email
- [ ] User navigates to main app
- [ ] Remember Me checkbox works

### Error Handling
- [ ] Wrong password shows user-friendly message
- [ ] Non-existent email shows user-friendly message
- [ ] Too many attempts shows user-friendly message
- [ ] Network errors show user-friendly message

### Logout
- [ ] Can log out from Profile screen
- [ ] User returns to login screen
- [ ] Session is cleared

---

## Performance Benchmarks

Expected response times:
- Registration: < 2 seconds
- Login: < 2 seconds
- Send verification email: < 1 second
- Logout: < 1 second

If operations take longer, check:
- Network connection
- Firebase project status
- Number of concurrent users

---

## Security Verification

Confirm these security measures:
- ✅ Email verification is required before login
- ✅ User is signed out immediately after registration
- ✅ User is signed out if email not verified during login
- ✅ Sensitive error details are not exposed to users
- ✅ No credentials are logged to console
- ✅ All Firebase operations are wrapped in try/catch

---

## Next Steps

After completing all tests:
1. Document any bugs found
2. Verify all features work on multiple platforms (iOS, Android, Web)
3. Test with multiple user accounts
4. Verify Firebase usage quotas
5. Plan for production deployment
