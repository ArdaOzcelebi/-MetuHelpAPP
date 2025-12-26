import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
// 1. NEW: Import Firestore
import { getFirestore, Firestore } from "firebase/firestore";

/**
 * Safe firebaseConfig for Expo (web + native):
 * - Does NOT initialize Firebase at module import time.
 * - Exports getAuthInstance() AND getDbInstance().
 * - Reads values directly from process.env.EXPO_PUBLIC_* variables.
 */

let firebaseApp: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined; // 2. NEW: Database state

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
 * INTERNAL HELPER: Starts the Firebase App.
 * This logic used to be inside getAuthInstance, but we moved it here
 * so the Database can use it too.
 */
function ensureAppInitialized(): FirebaseApp {
  if (firebaseApp) return firebaseApp;

  const config = resolveConfig();

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

  return firebaseApp;
}

/**
 * Initialize Firebase (idempotent) and return Auth.
 * (This works exactly the same as before, just calls the helper above)
 */
export function getAuthInstance(): Auth {
  if (authInstance) return authInstance;

  // Debug logs (Moved here to keep your console clean)
  const config = resolveConfig();
  log("============ Firebase Configuration Debug ============");
  log("Project ID:", config.projectId || "(undefined/empty)");
  log("====================================================");

  const app = ensureAppInitialized();
  authInstance = getAuth(app);
  log("✓ Auth instance ready");
  return authInstance;
}

/**
 * 3. NEW: Initialize Firebase and return the Database (Firestore).
 */
export function getDbInstance(): Firestore {
  if (dbInstance) return dbInstance;

  const app = ensureAppInitialized();
  dbInstance = getFirestore(app);
  log("✓ Firestore instance ready");
  return dbInstance;
}

/**
 * Return the Auth instance if already initialized, otherwise undefined.
 */
export function getAuthIfAvailable(): Auth | undefined {
  return authInstance;
}

/**
 * Check if Firebase configuration is available.
 */
export const hasFirebaseConfig = Boolean(
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
);
