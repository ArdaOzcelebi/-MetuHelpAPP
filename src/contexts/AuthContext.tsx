import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  User,
} from "firebase/auth";
import { getAuthInstance } from "../firebase/firebaseConfig";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  resendVerificationEmail: (email: string, password: string) => Promise<void>;
  updateProfileDisplayName: (displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Custom error types for better type safety
const AUTH_ERROR_TYPES = {
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
} as const;

/**
 * Parse Firebase error codes and return user-friendly error messages
 */
function parseFirebaseError(error: unknown): string {
  // Check if error has a code property (Firebase auth errors)
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      case "auth/email-already-in-use":
        return "This email address is already registered. Please sign in or use a different email.";
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/operation-not-allowed":
        return "Email/password sign-in is not enabled. Please contact support.";
      case "auth/weak-password":
        return "Password is too weak. Please use a stronger password with at least 8 characters.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/invalid-credential":
        return "Invalid email or password. Please check your credentials and try again.";
      case "auth/too-many-requests":
        return "Too many failed login attempts. Please try again later or reset your password.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection and try again.";
      case "auth/requires-recent-login":
        return "This action requires recent authentication. Please sign in again.";
      default:
        // Return the message if available
        if ("message" in error && typeof error.message === "string") {
          return error.message;
        }
        return "An authentication error occurred. Please try again.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    try {
      const auth = getAuthInstance();
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
    } catch (err) {
      // Firebase not configured or other error — do not throw during module import

      console.warn(
        "[AuthProvider] Firebase not configured or failed to initialize:",
        err,
      );
      setLoading(false);
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  async function signUp(email: string, password: string, rememberMe?: boolean) {
    try {
      const auth = getAuthInstance();
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Immediately send verification email (critical requirement)
      try {
        await firebaseSendEmailVerification(credential.user);
      } catch (verificationError) {
        // Log but don't fail the registration if email sending fails

        console.warn(
          "[signUp] sendEmailVerification failed:",
          verificationError,
        );
        // Still throw an error to inform the user
        throw new Error(
          "Account created but failed to send verification email. Please try resending it from the login screen.",
        );
      }

      // Small delay to allow modal to render before auth state changes
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Sign out the user immediately - they should not be logged in until verified
      await firebaseSignOut(auth);
    } catch (err) {
      const errorMessage = parseFirebaseError(err);
      throw new Error(errorMessage);
    }
  }

  async function signIn(email: string, password: string, rememberMe?: boolean) {
    try {
      const auth = getAuthInstance();
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Critical: Check if email is verified
      if (!credential.user.emailVerified) {
        // Sign out immediately if email is not verified
        await firebaseSignOut(auth);
        // Throw a specific error that the UI can catch
        throw new Error(AUTH_ERROR_TYPES.EMAIL_NOT_VERIFIED);
      }

      // If we reach here, user is verified and can proceed
      // Note: rememberMe functionality would typically be handled by persistence settings
      // For now, Firebase Auth handles persistence automatically
    } catch (err) {
      // If it's our custom EMAIL_NOT_VERIFIED error, throw it as-is
      if (
        err instanceof Error &&
        err.message === AUTH_ERROR_TYPES.EMAIL_NOT_VERIFIED
      ) {
        throw err;
      }
      // Otherwise, parse Firebase errors
      const errorMessage = parseFirebaseError(err);
      throw new Error(errorMessage);
    }
  }

  async function signOut() {
    console.log("[AuthContext] signOut called");
    try {
      const auth = getAuthInstance();
      console.log("[AuthContext] Calling firebaseSignOut");
      await firebaseSignOut(auth);
      console.log(
        "[AuthContext] firebaseSignOut completed, setting user to null",
      );
      setUser(null);
      console.log("[AuthContext] User set to null");
    } catch (err) {
      const errorMessage = parseFirebaseError(err);

      console.warn("[signOut] failed:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  async function sendEmailVerification() {
    try {
      const auth = getAuthInstance();
      if (!auth.currentUser) {
        throw new Error("No authenticated user");
      }
      await firebaseSendEmailVerification(auth.currentUser);
    } catch (err) {
      const errorMessage = parseFirebaseError(err);
      throw new Error(errorMessage);
    }
  }

  async function resendVerificationEmail(email: string, password: string) {
    try {
      const auth = getAuthInstance();

      // Sign in temporarily to send the verification email
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Only send verification email if not already verified
      if (!credential.user.emailVerified) {
        await firebaseSendEmailVerification(credential.user);
      } else {
        // Email already verified, sign out and throw informative error
        await firebaseSignOut(auth);
        throw new Error(
          "Your email is already verified. You can now log in normally.",
        );
      }

      // Sign out immediately after sending
      await firebaseSignOut(auth);
    } catch (err) {
      const errorMessage = parseFirebaseError(err);
      throw new Error(errorMessage);
    }
  }

  async function updateProfileDisplayName(displayName: string) {
    try {
      const auth = getAuthInstance();
      if (!auth.currentUser) {
        throw new Error("No authenticated user");
      }
      await firebaseUpdateProfile(auth.currentUser, { displayName });
      setUser({ ...auth.currentUser } as User);
    } catch (err) {
      const errorMessage = parseFirebaseError(err);
      throw new Error(errorMessage);
    }
  }

  async function resetPassword(email: string) {
    try {
      const auth = getAuthInstance();
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (err) {
      const errorMessage = parseFirebaseError(err);
      throw new Error(errorMessage);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        sendEmailVerification,
        resendVerificationEmail,
        updateProfileDisplayName,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
