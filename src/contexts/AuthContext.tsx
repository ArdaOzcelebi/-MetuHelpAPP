import React, { createContext, useContext, useEffect, useState } from ""react"";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  User,
  Auth,
} from ""firebase/auth"";
import { getAuthInstance, initFirebase, DEMO_MODE } from ""../firebase/firebaseConfig"";
import { setItem, getItem, removeItem } from ""../services/storage"";

if (!DEMO_MODE) {
  initFirebase();
}

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, remember?: boolean) => Promise<void>;
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resendVerification: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const REMEMBER_KEY = ""remember_me"";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const auth: Auth | null = getAuthInstance();

  useEffect(() => {
    if (!auth) {
      // demo mode: no firebase auth. set loading false immediately
      setUser(null);
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, [auth]);

  function validateForRegister(email: string, password: string) {
    if (!email.toLowerCase().endsWith(""@metu.edu.tr"")) {
      throw new Error(""Registration requires an @metu.edu.tr email."");
    }
    if (password.length < 8) {
      throw new Error(""Password must be at least 8 characters."");
    }
    if (!/\d/.test(password)) {
      throw new Error(""Password must contain at least one digit."");
    }
  }

  const signUp = async (email: string, password: string, remember = false) => {
    if (!auth) throw new Error(""Authentication is not configured (demo mode)."");
    validateForRegister(email, password);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (cred.user) {
      await sendEmailVerification(cred.user);
      if (remember) await setItem(REMEMBER_KEY, ""1"");
      else await removeItem(REMEMBER_KEY);
    }
  };

  const signIn = async (email: string, password: string, remember = false) => {
    if (!auth) throw new Error(""Authentication is not configured (demo mode)."");
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (cred.user && !cred.user.emailVerified) {
      await firebaseSignOut(auth);
      throw new Error(""Email not verified. Please verify your email."");
    }
    if (remember) await setItem(REMEMBER_KEY, ""1"");
    else await removeItem(REMEMBER_KEY);
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    await removeItem(REMEMBER_KEY);
    setUser(null);
  };

  const resendVerification = async () => {
    if (!auth) throw new Error(""Authentication is not configured (demo mode)."");
    const u = auth.currentUser;
    if (!u) throw new Error(""No signed in user"");
    await sendEmailVerification(u);
  };

  const updateDisplayName = async (name: string) => {
    if (!auth) throw new Error(""Authentication is not configured (demo mode)."");
    const u = auth.currentUser;
    if (!u) throw new Error(""No signed in user"");
    await firebaseUpdateProfile(u, { displayName: name });
    setUser({ ...u } as User);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, resendVerification, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error(""useAuth must be used inside AuthProvider"");
  return ctx;
}
