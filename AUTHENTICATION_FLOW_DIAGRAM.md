# Authentication Flow Diagram

This document provides a visual representation of the authentication flow implemented in the METU Help app.

## Registration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        REGISTRATION FLOW                         │
└─────────────────────────────────────────────────────────────────┘

User Opens App
      │
      ├─→ No Auth → Show Login Screen
      │
      └─→ Click "Sign Up"
            │
            ▼
      ┌─────────────────┐
      │ Register Screen │
      └─────────────────┘
            │
            ├─→ Enter @metu.edu.tr email
            ├─→ Enter password (8+ chars, 1 digit)
            └─→ Confirm password
            │
            ▼
      Click "Sign Up" Button
            │
            ▼
      ┌─────────────────────────────────────┐
      │   AuthContext.signUp(email, pass)   │
      └─────────────────────────────────────┘
            │
            ├─→ createUserWithEmailAndPassword() ✅
            │
            ├─→ sendEmailVerification() ✅
            │
            └─→ firebaseSignOut() ✅ (Important!)
            │
            ▼
      ┌─────────────────────────────────────┐
      │  Alert: "Registration Successful!   │
      │  Please check your email..."         │
      └─────────────────────────────────────┘
            │
            ▼
      Navigate to Login Screen
            │
            ▼
      📧 User receives verification email
```

## Login Flow (Unverified Email)

```
┌─────────────────────────────────────────────────────────────────┐
│                  LOGIN FLOW (UNVERIFIED EMAIL)                   │
└─────────────────────────────────────────────────────────────────┘

User on Login Screen
      │
      ├─→ Enter email
      ├─→ Enter password
      └─→ Click "Sign In"
            │
            ▼
      ┌──────────────────────────────────────┐
      │  AuthContext.signIn(email, pass)     │
      └──────────────────────────────────────┘
            │
            ├─→ signInWithEmailAndPassword() ✅
            │
            ▼
      Check: user.emailVerified?
            │
            ├─→ NO ❌
            │     │
            │     ├─→ firebaseSignOut() ✅ (Immediate!)
            │     │
            │     └─→ throw Error("EMAIL_NOT_VERIFIED")
            │           │
            │           ▼
            │     ┌─────────────────────────────────────┐
            │     │  Alert: "Email Not Verified         │
            │     │  Please verify your email..."        │
            │     │  [Cancel] [Resend Verification]     │
            │     └─────────────────────────────────────┘
            │           │
            │           ├─→ Click "Cancel" → Stay on Login
            │           │
            │           └─→ Click "Resend Verification"
            │                 │
            │                 ▼
            │           ┌────────────────────────────────────┐
            │           │  resendVerificationEmail(e, p)     │
            │           └────────────────────────────────────┘
            │                 │
            │                 ├─→ Sign in temporarily
            │                 ├─→ Send verification email ✅
            │                 └─→ Sign out immediately
            │                 │
            │                 ▼
            │           Alert: "Verification Email Sent!"
            │                 │
            │                 ▼
            │           📧 New verification email sent
            │
            └─→ YES ✅ → (See "Login Flow - Verified Email" below)
```

## Login Flow (Verified Email)

```
┌─────────────────────────────────────────────────────────────────┐
│                  LOGIN FLOW (VERIFIED EMAIL)                     │
└─────────────────────────────────────────────────────────────────┘

User on Login Screen
      │
      ├─→ Enter email
      ├─→ Enter password
      └─→ Click "Sign In"
            │
            ▼
      ┌──────────────────────────────────────┐
      │  AuthContext.signIn(email, pass)     │
      └──────────────────────────────────────┘
            │
            ├─→ signInWithEmailAndPassword() ✅
            │
            ▼
      Check: user.emailVerified?
            │
            └─→ YES ✅
                  │
                  ▼
            User stays signed in
                  │
                  ▼
      ┌─────────────────────────────────────┐
      │   App.tsx detects auth state        │
      │   → Shows MainTabNavigator          │
      └─────────────────────────────────────┘
                  │
                  ▼
      User sees main app (Home, Browse, Profile)
```

## Email Verification Process

```
┌─────────────────────────────────────────────────────────────────┐
│                   EMAIL VERIFICATION PROCESS                     │
└─────────────────────────────────────────────────────────────────┘

User registers → Email sent automatically
      │
      ▼
📧 Firebase sends verification email
      │
      ├─→ Subject: "Verify your email"
      └─→ Contains verification link
            │
            ▼
User opens email
      │
      ├─→ Click verification link
            │
            ▼
      Opens in web browser
            │
            ▼
      Firebase verifies email
            │
            ▼
      ┌─────────────────────────────────────┐
      │  Firebase Console: Email marked     │
      │  as "verified" ✅                   │
      └─────────────────────────────────────┘
            │
            ▼
      User returns to app
            │
            └─→ Can now log in successfully!
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING FLOW                         │
└─────────────────────────────────────────────────────────────────┘

Any Firebase Operation
      │
      ▼
Try/Catch Block
      │
      ├─→ Success ✅ → Continue
      │
      └─→ Error ❌
            │
            ▼
      ┌──────────────────────────────────────┐
      │  parseFirebaseError(error)           │
      └──────────────────────────────────────┘
            │
            ├─→ auth/email-already-in-use
            │     → "This email address is already registered..."
            │
            ├─→ auth/wrong-password
            │     → "Incorrect password. Please try again."
            │
            ├─→ auth/invalid-credential
            │     → "Invalid email or password..."
            │
            ├─→ auth/too-many-requests
            │     → "Too many failed login attempts..."
            │
            ├─→ auth/network-request-failed
            │     → "Network error. Please check your connection..."
            │
            └─→ Other errors
                  → User-friendly generic message
            │
            ▼
      Display error to user in UI
      (Alert or inline error message)
```

## Logout Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                          LOGOUT FLOW                             │
└─────────────────────────────────────────────────────────────────┘

User in Main App
      │
      └─→ Navigate to Profile Tab
            │
            └─→ Scroll down
                  │
                  └─→ Click "Log Out" button
                        │
                        ▼
                  ┌─────────────────────────────────────┐
                  │  Alert: "Are you sure you want      │
                  │  to log out?"                       │
                  │  [Cancel] [Log Out]                 │
                  └─────────────────────────────────────┘
                        │
                        ├─→ Click "Cancel" → Stay in app
                        │
                        └─→ Click "Log Out"
                              │
                              ▼
                        ┌──────────────────────────────────────┐
                        │  AuthContext.signOut()               │
                        └──────────────────────────────────────┘
                              │
                              ├─→ firebaseSignOut() ✅
                              │
                              └─→ setUser(null)
                              │
                              ▼
                        ┌─────────────────────────────────────┐
                        │  App.tsx detects auth state         │
                        │  → Shows AuthStackNavigator         │
                        └─────────────────────────────────────┘
                              │
                              ▼
                        User sees Login Screen
```

## State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT                            │
└─────────────────────────────────────────────────────────────────┘

AuthContext maintains:
      │
      ├─→ user: User | null
      │     └─→ null when not authenticated
      │     └─→ User object when authenticated
      │
      ├─→ loading: boolean
      │     └─→ true while checking auth state
      │     └─→ false when auth state is known
      │
      └─→ Functions:
            ├─→ signUp(email, password, rememberMe?)
            ├─→ signIn(email, password, rememberMe?)
            ├─→ signOut()
            ├─→ sendEmailVerification()
            ├─→ resendVerificationEmail(email, password)
            └─→ updateProfileDisplayName(name)

Firebase Auth State Listener:
      │
      └─→ onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
          })

App.tsx renders based on auth state:
      │
      ├─→ loading === true
      │     └─→ Show loading spinner
      │
      ├─→ user === null
      │     └─→ Show AuthStackNavigator (Login/Register)
      │
      └─→ user !== null
            └─→ Show MainTabNavigator (Home/Browse/Profile)
```

## Security Checkpoints

```
┌─────────────────────────────────────────────────────────────────┐
│                     SECURITY CHECKPOINTS                         │
└─────────────────────────────────────────────────────────────────┘

1. Registration
   ├─→ ✅ Email verification sent immediately
   └─→ ✅ User signed out immediately

2. Login
   ├─→ ✅ Check user.emailVerified
   ├─→ ✅ Sign out if not verified
   └─→ ✅ Only verified users can access app

3. Resend Verification
   ├─→ ✅ Requires valid credentials
   ├─→ ✅ Only sends if not already verified
   └─→ ✅ Signs out immediately after sending

4. Error Handling
   ├─→ ✅ All Firebase calls in try/catch
   ├─→ ✅ User-friendly error messages
   └─→ ✅ No sensitive data exposed

5. Auth State
   ├─→ ✅ Managed by Firebase Auth
   ├─→ ✅ Listener updates app state
   └─→ ✅ Automatic session management
```

## Key Implementation Details

### Constants
```typescript
const AUTH_ERROR_TYPES = {
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
} as const;
```

### Email Verification Check (Login)
```typescript
if (!credential.user.emailVerified) {
  await firebaseSignOut(auth);
  throw new Error(AUTH_ERROR_TYPES.EMAIL_NOT_VERIFIED);
}
```

### Resend Verification
```typescript
async function resendVerificationEmail(email: string, password: string) {
  // 1. Sign in temporarily
  const credential = await signInWithEmailAndPassword(auth, email, password);
  
  // 2. Check if already verified
  if (!credential.user.emailVerified) {
    await firebaseSendEmailVerification(credential.user);
  }
  
  // 3. Sign out immediately
  await firebaseSignOut(auth);
}
```

### Error Parsing
```typescript
function parseFirebaseError(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      case "auth/email-already-in-use":
        return "This email address is already registered...";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      // ... more cases
    }
  }
  return "An unexpected error occurred. Please try again.";
}
```

## Summary

The authentication system provides:

✅ **Secure**: Email verification required, multiple checkpoints  
✅ **User-Friendly**: Clear error messages, helpful alerts  
✅ **Robust**: Comprehensive error handling  
✅ **Type-Safe**: Full TypeScript typing  
✅ **Well-Tested**: No security vulnerabilities (CodeQL)  
✅ **Documented**: Extensive inline and external documentation  

All flows are designed to prioritize security while maintaining a great user experience.
