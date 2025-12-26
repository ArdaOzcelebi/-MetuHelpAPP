import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

/**
 * Safe firebaseConfig for Expo (web + native):
 * - Does NOT initialize Firebase at module import time.
 * - Exports getAuthInstance() which initializes (idempotent) and returns Auth (throws if missing config).
 * - Exports getAuthIfAvailable() which returns the Auth instance or undefined (does not throw).
 * - Exports getFirestoreInstance() which initializes (idempotent) and returns Firestore.
 *
 * Reads values directly from process.env.EXPO_PUBLIC_* variables.
 */

let firebaseApp: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let firestoreInstance: Firestore | undefined;

function log(...args: any[]) {
  console.log("[firebaseConfig]", ...args);
}

function resolveConfig() {
  const cfg = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? undefined,
    messagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? undefined,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? undefined,
  } as const;

  return cfg;
}

/**
 * Initialize Firebase (idempotent) and return Auth.
 * Throws an Error if apiKey is missing (explicit error makes the source obvious).
 */
export function getAuthInstance(): Auth {
  if (authInstance) return authInstance;

  const config = resolveConfig();

  // Log individual config values for debugging
  log("============ Firebase Configuration Debug ============");
  log("API Key:", config.apiKey || "(undefined/empty)");
  log("Auth Domain:", config.authDomain || "(undefined/empty)");
  log("Project ID:", config.projectId || "(undefined/empty)");
  log("Storage Bucket:", config.storageBucket || "(undefined/empty)");
  log("Messaging Sender ID:", config.messagingSenderId || "(undefined/empty)");
  log("App ID:", config.appId || "(undefined/empty)");
  log("====================================================");

  if (!config.apiKey) {
    const msg =
      "Firebase API key is missing. Check .env.local file and ensure EXPO_PUBLIC_FIREBASE_API_KEY is set";
    log("ERROR:", msg);
    throw new Error(msg);
  }

  if (!getApps().length) {
    log("Initializing Firebase app with config...");
    firebaseApp = initializeApp(config);
    log("✓ Firebase app initialized successfully");
  } else {
    firebaseApp = getApps()[0];
    log("✓ Using existing Firebase app");
  }

  authInstance = getAuth(firebaseApp);
  log("✓ Auth instance ready");
  return authInstance;
}

/**
 * Return the Auth instance if already initialized, otherwise undefined.
 * Useful for code paths that should not throw during render.
 */
export function getAuthIfAvailable(): Auth | undefined {
  return authInstance;
}

/**
 * Return the Firestore instance if already initialized, otherwise undefined.
 */
export function getFirestoreIfAvailable(): Firestore | undefined {
  return firestoreInstance;
}

/**
 * Initialize Firebase (idempotent) and return Firestore.
 * Throws an Error if apiKey is missing.
 */
export function getFirestoreInstance(): Firestore {
  if (firestoreInstance) return firestoreInstance;

  // Ensure Firebase app is initialized first
  if (!firebaseApp) {
    getAuthInstance(); // This will initialize the app
  }

  if (!firebaseApp) {
    throw new Error("Firebase app not initialized");
  }

  firestoreInstance = getFirestore(firebaseApp);
  log("✓ Firestore instance ready");
  return firestoreInstance;
}

/**
 * Check if Firebase configuration is available.
 * Returns true if API key is present, false otherwise.
 */
export const hasFirebaseConfig = Boolean(
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
);
