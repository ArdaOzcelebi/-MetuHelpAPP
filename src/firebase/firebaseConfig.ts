import Constants from 'expo-constants';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

/**
 * Safe firebaseConfig for Expo (web + native):
 * - Does NOT initialize Firebase at module import time.
 * - Exports getAuthInstance() which initializes (idempotent) and returns Auth (throws if missing config).
 * - Exports getAuthIfAvailable() which returns the Auth instance or undefined (does not throw).
 *
 * Reads values from Constants.expoConfig.extra (set via app.config.js) first,
 * falls back to process.env.NEXT_PUBLIC_* or process.env.FIREBASE_*.
 */

let firebaseApp: FirebaseApp | undefined;
let authInstance: Auth | undefined;

function log(...args: any[]) {
  // eslint-disable-next-line no-console
  console.log('[firebaseConfig]', ...args);
}

function readExtra(key: string): string | undefined {
  const extras =
    (Constants.expoConfig && (Constants.expoConfig.extra as any)) ||
    (Constants.manifest && (Constants.manifest.extra as any)) ||
    {};
  const val = extras[key];
  return typeof val === 'string' && val.length ? val : undefined;
}

function readEnv(key: string): string | undefined {
  const publicKey = (process.env as any)[`NEXT_PUBLIC_${key}`];
  if (typeof publicKey === 'string' && publicKey.length) return publicKey;
  const raw = (process.env as any)[key];
  if (typeof raw === 'string' && raw.length) return raw;
  return undefined;
}

function resolveConfig() {
  const cfg = {
    apiKey: readExtra('FIREBASE_API_KEY') ?? readEnv('FIREBASE_API_KEY') ?? '',
    authDomain: readExtra('FIREBASE_AUTH_DOMAIN') ?? readEnv('FIREBASE_AUTH_DOMAIN') ?? '',
    projectId: readExtra('FIREBASE_PROJECT_ID') ?? readEnv('FIREBASE_PROJECT_ID') ?? '',
    storageBucket: readExtra('FIREBASE_STORAGE_BUCKET') ?? readEnv('FIREBASE_STORAGE_BUCKET') ?? undefined,
    messagingSenderId:
      readExtra('FIREBASE_MESSAGING_SENDER_ID') ?? readEnv('FIREBASE_MESSAGING_SENDER_ID') ?? undefined,
    appId: readExtra('FIREBASE_APP_ID') ?? readEnv('FIREBASE_APP_ID') ?? undefined,
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
  log('Resolved firebase config:', config);

  if (!config.apiKey) {
    const msg = 'Firebase API key is missing. Check app.config.js / .env.local / process.env';
    log(msg);
    throw new Error(msg);
  }

  if (!getApps().length) {
    firebaseApp = initializeApp(config);
    log('Firebase app initialized');
  } else {
    firebaseApp = getApps()[0];
    log('Using existing Firebase app');
  }

  authInstance = getAuth(firebaseApp);
  log('Auth instance ready');
  return authInstance;
}

/**
 * Return the Auth instance if already initialized, otherwise undefined.
 * Useful for code paths that should not throw during render.
 */
export function getAuthIfAvailable(): Auth | undefined {
  return authInstance;
}