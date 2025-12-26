// Import Firebase SDKs
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, doc, writeBatch, collection, addDoc, getDocs, query, onSnapshot } from "firebase/firestore";

// State for Firebase services
let firebaseApp: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;

// Logging utility
function log(...args: any[]) {
  console.log("[firebaseConfig]", ...args);
}

// Resolve configuration from environment variables
function resolveConfig() {
  const cfg = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? undefined,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? undefined,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? undefined,
  } as const;

  if (!cfg.apiKey) {
    const msg =
      "Firebase API key is missing. Ensure EXPO_PUBLIC_FIREBASE_API_KEY is set correctly in .env.local.";
    log("ERROR:", msg);
    throw new Error(msg);
  }

  return cfg;
}

// Initialize Firebase (idempotent)
function ensureAppInitialized(): FirebaseApp {
  if (firebaseApp) return firebaseApp;

  const config = resolveConfig();

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

// Get Firebase Auth instance
export function getAuthInstance(): Auth {
  if (authInstance) return authInstance;

  const app = ensureAppInitialized();
  authInstance = getAuth(app);
  log("✓ Auth instance ready");
  return authInstance;
}

// Get Firestore Database instance
export function getDbInstance(): Firestore {
  if (dbInstance) return dbInstance;

  const app = ensureAppInitialized();
  dbInstance = getFirestore(app);
  log("✓ Firestore instance ready");
  return dbInstance;
}

// Return Auth instance if initialized
export function getAuthIfAvailable(): Auth | undefined {
  return authInstance;
}

// Check if Firebase configuration is available
export const hasFirebaseConfig = Boolean(process.env.EXPO_PUBLIC_FIREBASE_API_KEY);

// Firestore helper functions

/**
 * Fetch all active Help Requests in real-time.
 * Uses onSnapshot() for real-time updates.
 */
export function fetchHelpRequestsRealTime(callback: (data: any[]) => void) {
  const db = getDbInstance();
  const helpRequestsRef = collection(db, "helpRequests");

  const q = query(helpRequestsRef);
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(data); // Pass fetched data to the callback
  });

  return unsubscribe; // Return unsubscribing method for cleanup
}

/**
 * Add a new Help Request to the Firestore Database.
 */
export async function addHelpRequest(helpRequest: {
  item: string;
  category: string;
  description: string;
  location: string;
  needReturn: boolean;
  isAnonymous: boolean;
}) {
  const db = getDbInstance();
  const helpRequestsRef = collection(db, "helpRequests");

  try {
    await addDoc(helpRequestsRef, {
      ...helpRequest,
      createdAt: new Date(),
      status: "active", // Default status for a new request
    });
    log("✓ Help request added successfully.");
  } catch (error) {
    log("ERROR: Failed to add help request:", error);
    throw error;
  }
}

/**
 * Fetch all Help Requests (non-realtime, for archival or filtering purposes).
 */
export async function fetchHelpRequests() {
  const db = getDbInstance();
  const helpRequestsRef = collection(db, "helpRequests");

  try {
    const snapshot = await getDocs(helpRequestsRef);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return data;
  } catch (error) {
    log("ERROR: Failed to fetch help requests:", error);
    throw error;
  }
}

/**
 * Bulk import predefined Help Requests into Firestore.
 * Helpful for adding predefined locations/categories/documents.
 */
export async function addBulkHelpRequests(helpRequests: {
  item: string;
  category: string;
  description: string;
  location: string;
  needReturn: boolean;
  isAnonymous: boolean;
}[]) {
  const db = getDbInstance();
  const batch = writeBatch(db);

  try {
    helpRequests.forEach((request) => {
      const docRef = doc(collection(db, "helpRequests"));
      batch.set(docRef, {
        ...request,
        createdAt: new Date(),
        status: "active",
      });
    });

    await batch.commit();
    log("✓ Bulk help requests added successfully.");
  } catch (error) {
    log("ERROR: Failed to add bulk requests:", error);
    throw error;
  }
}
