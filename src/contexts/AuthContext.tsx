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
import { auth } from "@/src/firebase/firebaseConfig";
import { storage } from "@/src/services/storage";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    rememberMe: boolean,
  ) => Promise<void>;
  signIn: (
    email: string,
    password: string,
    rememberMe: boolean,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REMEMBER_ME_KEY = "rememberMe";

/**
 * Validates email format and ensures it ends with @metu.edu.tr
 */
function validateEmail(email: string): { isValid: boolean; error?: string } {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail) {
    return { isValid: false, error: "Email is required" };
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: "Invalid email format" };
  }

  // Check if email ends with @metu.edu.tr
  if (!trimmedEmail.endsWith("@metu.edu.tr")) {
    return {
      isValid: false,
      error: "Only @metu.edu.tr email addresses are allowed",
    };
  }

  return { isValid: true };
}

/**
 * Validates password meets minimum requirements
 */
function validatePassword(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: "Password must be at least 8 characters long",
    };
  }

  // Check if password contains at least one digit
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one digit",
    };
  }

  return { isValid: true };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user had "remember me" enabled
    const checkRememberMe = async () => {
      const rememberMe = await storage.getItem(REMEMBER_ME_KEY);
      if (!rememberMe) {
        // If remember me is not set, clear any existing session
        await firebaseSignOut(auth);
      }
    };

    checkRememberMe();

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (
    email: string,
    password: string,
    rememberMe: boolean,
  ): Promise<void> => {
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error);
    }

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password,
      );

      // Send email verification
      await firebaseSendEmailVerification(userCredential.user);

      // Store remember me preference
      if (rememberMe) {
        await storage.setItem(REMEMBER_ME_KEY, "true");
      } else {
        await storage.removeItem(REMEMBER_ME_KEY);
      }
    } catch (error: any) {
      // Map Firebase error codes to user-friendly messages
      let errorMessage = "Failed to create account";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection";
      }

      throw new Error(errorMessage);
    }
  };

  const signIn = async (
    email: string,
    password: string,
    rememberMe: boolean,
  ): Promise<void> => {
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }

    if (!password) {
      throw new Error("Password is required");
    }

    try {
      // Sign in user
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password,
      );

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        throw new Error("EMAIL_NOT_VERIFIED");
      }

      // Store remember me preference
      if (rememberMe) {
        await storage.setItem(REMEMBER_ME_KEY, "true");
      } else {
        await storage.removeItem(REMEMBER_ME_KEY);
      }
    } catch (error: any) {
      // Special handling for email not verified
      if (error.message === "EMAIL_NOT_VERIFIED") {
        throw error;
      }

      // Map Firebase error codes to user-friendly messages
      let errorMessage = "Failed to sign in";

      if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection";
      }

      throw new Error(errorMessage);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      await storage.removeItem(REMEMBER_ME_KEY);
    } catch (error) {
      throw new Error("Failed to sign out");
    }
  };

  const sendEmailVerification = async (): Promise<void> => {
    if (!user) {
      throw new Error("No user is currently signed in");
    }

    try {
      await firebaseSendEmailVerification(user);
    } catch (error) {
      throw new Error("Failed to send verification email");
    }
  };

  const resendVerificationEmail = async (): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error("No user is currently signed in");
    }

    try {
      await firebaseSendEmailVerification(auth.currentUser);
    } catch (error: any) {
      if (error.code === "auth/too-many-requests") {
        throw new Error("Too many requests. Please wait before trying again");
      }
      throw new Error("Failed to send verification email");
    }
  };

  const updateProfile = async (displayName: string): Promise<void> => {
    if (!user) {
      throw new Error("No user is currently signed in");
    }

    try {
      await firebaseUpdateProfile(user, { displayName });
      // Refresh user data
      await user.reload();
      setUser({ ...user });
    } catch (error) {
      throw new Error("Failed to update profile");
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    sendEmailVerification,
    resendVerificationEmail,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
