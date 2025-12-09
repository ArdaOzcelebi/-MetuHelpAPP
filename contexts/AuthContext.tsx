import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification as firebaseSendEmailVerification,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { storage } from "@/services/storage";

const REMEMBER_ME_KEY = "rememberMe";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user should be remembered on mount
    const checkRememberMe = async () => {
      const rememberMe = await storage.getItem(REMEMBER_ME_KEY);
      if (!rememberMe) {
        // If rememberMe is not set, sign out any existing session
        await firebaseSignOut(auth);
      }
    };

    checkRememberMe();

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Validate email format
   */
  const validateEmail = (email: string): void => {
    if (!email.endsWith("@metu.edu.tr")) {
      throw new Error("Only @metu.edu.tr emails are allowed to register");
    }
  };

  /**
   * Validate password strength
   */
  const validatePassword = (password: string): void => {
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }
    if (!/\d/.test(password)) {
      throw new Error("Password must contain at least one digit");
    }
  };

  /**
   * Sign up a new user
   */
  const signUp = async (
    email: string,
    password: string,
    rememberMe: boolean,
  ): Promise<void> => {
    try {
      // Validate inputs
      validateEmail(email);
      validatePassword(password);

      // Create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Send verification email
      await firebaseSendEmailVerification(userCredential.user);

      // Handle remember me
      if (rememberMe) {
        await storage.setItem(REMEMBER_ME_KEY, "true");
      } else {
        await storage.removeItem(REMEMBER_ME_KEY);
      }
    } catch (error: any) {
      // Re-throw validation errors
      if (error.message.includes("@metu.edu.tr") || error.message.includes("Password")) {
        throw error;
      }

      // Handle Firebase errors
      switch (error.code) {
        case "auth/email-already-in-use":
          throw new Error("This email is already registered");
        case "auth/invalid-email":
          throw new Error("Invalid email address");
        case "auth/weak-password":
          throw new Error("Password is too weak");
        default:
          throw new Error(error.message || "Failed to create account");
      }
    }
  };

  /**
   * Sign in an existing user
   */
  const signIn = async (
    email: string,
    password: string,
    rememberMe: boolean,
  ): Promise<void> => {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        // Sign out the user since email is not verified
        await firebaseSignOut(auth);
        throw new Error("Please verify your email before logging in. Check your inbox for the verification link.");
      }

      // Handle remember me
      if (rememberMe) {
        await storage.setItem(REMEMBER_ME_KEY, "true");
      } else {
        await storage.removeItem(REMEMBER_ME_KEY);
      }
    } catch (error: any) {
      // Re-throw verification error
      if (error.message.includes("verify your email")) {
        throw error;
      }

      // Handle Firebase errors
      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          throw new Error("Invalid email or password");
        case "auth/invalid-email":
          throw new Error("Invalid email address");
        case "auth/user-disabled":
          throw new Error("This account has been disabled");
        case "auth/too-many-requests":
          throw new Error("Too many failed login attempts. Please try again later");
        default:
          throw new Error(error.message || "Failed to sign in");
      }
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async (): Promise<void> => {
    try {
      await storage.removeItem(REMEMBER_ME_KEY);
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error(error.message || "Failed to sign out");
    }
  };

  /**
   * Send email verification to current user
   */
  const sendEmailVerification = async (): Promise<void> => {
    if (!user) {
      throw new Error("No user is currently signed in");
    }
    try {
      await firebaseSendEmailVerification(user);
    } catch (error: any) {
      throw new Error(error.message || "Failed to send verification email");
    }
  };

  /**
   * Resend verification email
   */
  const resendVerificationEmail = async (): Promise<void> => {
    if (!user) {
      throw new Error("No user is currently signed in");
    }
    try {
      await firebaseSendEmailVerification(user);
    } catch (error: any) {
      if (error.code === "auth/too-many-requests") {
        throw new Error("Too many requests. Please wait before requesting another verification email");
      }
      throw new Error(error.message || "Failed to resend verification email");
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (displayName: string): Promise<void> => {
    if (!user) {
      throw new Error("No user is currently signed in");
    }
    try {
      await firebaseUpdateProfile(user, { displayName });
      // Refresh user state
      await user.reload();
      setUser(auth.currentUser);
    } catch (error: any) {
      throw new Error(error.message || "Failed to update profile");
    }
  };

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
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
