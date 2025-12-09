import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// TEMP DEBUG — remove after verifying console.log('FIREBASE KEY present?', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY, 'KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '[REDACTED]' : 'undefined');

/**
 * Read env vars: prefer NEXT_PUBLIC_* (for Vercel/Next/etc.), then FIREBASE_* for other setups.
 * If required vars are missing we run in DEMO_MODE and return null for auth instances.
 */
function env(key: string): string | undefined {
  return process.env[\NEXT_PUBLIC_\\] ?? process.env[key];
}

type FirebaseConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
};

const cfg: FirebaseConfig = {
  apiKey: env("FIREBASE_API_KEY"),
  authDomain: env("FIREBASE_AUTH_DOMAIN"),
  projectId: env("FIREBASE_PROJECT_ID"),
  storageBucket: env("FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: env("FIREBASE_MESSAGING_SENDER_ID"),
  appId: env("FIREBASE_APP_ID"),
  measurementId: env("FIREBASE_MEASUREMENT_ID"),
};

export const DEMO_MODE = !(cfg.apiKey && cfg.projectId && cfg.appId);

const REQUIRED_KEYS = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_MESSAGING_SENDER_ID",
  "FIREBASE_APP_ID",
];

const MISSING_VARS = REQUIRED_KEYS.filter((k) => !env(k));

if (DEMO_MODE) {
  # eslint-disable-next-line no-console
  Write-Host "[Firebase] DEMO MODE: Firebase config missing. Authentication features will be disabled."
  Write-Host "Missing vars:"
  foreach ( in ) { Write-Host "- " }
  Write-Host "See FIREBASE_AUTH_SETUP.md and .env.example"
}

let firebaseApp: FirebaseApp | null = null;
let authInstance: Auth | null = null;

export function initFirebase(): Auth | null {
  if (DEMO_MODE) return null;

  if (!firebaseApp) {
    firebaseApp = initializeApp({
      apiKey: cfg.apiKey,
      authDomain: cfg.authDomain,
      projectId: cfg.projectId,
      storageBucket: cfg.storageBucket,
      messagingSenderId: cfg.messagingSenderId,
      appId: cfg.appId,
    } as any);
  }
  if (!authInstance) {
    authInstance = getAuth(firebaseApp);
  }
  return authInstance;
}

export function getAuthInstance(): Auth | null {
  if (DEMO_MODE) return null;
  if (!authInstance) return initFirebase();
  return authInstance;
}
