import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";

/**
 * Robust Firebase Configuration for MetuHelpApp
 *
 * This module provides idempotent, lazy initialization of Firebase services
 * with environment-based configuration. It supports both web and native Expo builds.
 *
 * Key Features:
 * - Single source of truth for Firebase initialization
 * - Idempotent initialization (safe to call multiple times)
 * - Environment variable based configuration (EXPO_PUBLIC_FIREBASE_*)
 * - Fail-fast error handling with clear messaging
 * - Debug logging for development
 *
 * Usage:
 *   import { getAuthInstance, getFirestoreInstance } from '@/src/firebase/firebaseConfig';
 *   const auth = getAuthInstance();
 *   const db = getFirestoreInstance();
 */

let firebaseApp = undefined;
let authInstance = undefined;
let firestoreInstance = undefined;

/**
 * Internal logging helper for debugging
 * @param {...any} args - Arguments to log
 */
function log(...args) {
  if (__DEV__) {
    console.log("[firebaseConfig]", ...args);
  }
}

/**
 * Resolve Firebase configuration from environment variables
 * Reads from process.env.EXPO_PUBLIC_FIREBASE_* variables at runtime
 * @returns {Object} Firebase configuration object
 */
function resolveConfig() {
  const cfg = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
  };

  return cfg;
}

/**
 * Validate that all required Firebase configuration values are present
 * @param {Object} config - Firebase configuration object
 * @throws {Error} If any required configuration value is missing
 */
function validateConfig(config) {
  const required = ["apiKey", "authDomain", "projectId"];
  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0) {
    const msg =
      `Missing required Firebase configuration: ${missing.join(", ")}. ` +
      `Please check your .env.local file and ensure all EXPO_PUBLIC_FIREBASE_* variables are set.`;
    log("ERROR:", msg);
    throw new Error(msg);
  }
}

/**
 * Initialize Firebase app if not already initialized
 * This function is idempotent - safe to call multiple times
 * @returns {Object} Firebase app instance
 * @throws {Error} If configuration is invalid
 */
function initializeFirebaseApp() {
  if (firebaseApp) {
    log("✓ Using existing Firebase app");
    return firebaseApp;
  }

  const config = resolveConfig();

  // Log configuration for debugging (only in development)
  log("============ Firebase Configuration Debug ============");
  log(
    "API Key:",
    config.apiKey ? `${config.apiKey.substring(0, 10)}...` : "(missing)",
  );
  log("Auth Domain:", config.authDomain || "(missing)");
  log("Project ID:", config.projectId || "(missing)");
  log("Storage Bucket:", config.storageBucket || "(missing)");
  log("Messaging Sender ID:", config.messagingSenderId || "(missing)");
  log(
    "App ID:",
    config.appId ? `${config.appId.substring(0, 20)}...` : "(missing)",
  );
  log("====================================================");

  // Validate configuration
  validateConfig(config);

  // Check if Firebase is already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0];
    log("✓ Using existing Firebase app instance");
  } else {
    firebaseApp = initializeApp(config);
    log("✓ Firebase app initialized successfully");
  }

  return firebaseApp;
}

/**
 * Get initialized Firebase Auth instance
 * Initializes Firebase app if not already initialized
 *
 * @returns {Object} Firebase Auth instance
 * @throws {Error} If Firebase configuration is invalid
 *
 * @example
 * import { getAuthInstance } from '@/src/firebase/firebaseConfig';
 * const auth = getAuthInstance();
 */
export function getAuthInstance() {
  if (authInstance) {
    return authInstance;
  }

  const app = initializeFirebaseApp();
  authInstance = getAuth(app);
  log("✓ Auth instance ready");
  return authInstance;
}

/**
 * Get Firebase Auth instance if available (non-throwing)
 * Returns undefined if Auth has not been initialized yet
 * Useful for optional access without triggering initialization
 *
 * @returns {Object|undefined} Firebase Auth instance or undefined
 */
export function getAuthIfAvailable() {
  return authInstance;
}

/**
 * Get initialized Firebase Firestore instance
 * Initializes Firebase app if not already initialized
 *
 * @returns {Object} Firebase Firestore instance
 * @throws {Error} If Firebase configuration is invalid
 *
 * @example
 * import { getFirestoreInstance } from '@/src/firebase/firebaseConfig';
 * const db = getFirestoreInstance();
 */
export function getFirestoreInstance() {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  const app = initializeFirebaseApp();
  firestoreInstance = getFirestore(app);
  log("✓ Firestore instance ready");
  return firestoreInstance;
}

/**
 * Get Firestore instance if available (non-throwing)
 * Returns undefined if Firestore has not been initialized yet
 *
 * @returns {Object|undefined} Firebase Firestore instance or undefined
 */
export function getFirestoreIfAvailable() {
  return firestoreInstance;
}

/**
 * Check if Firebase configuration is available
 * @returns {boolean} True if API key is present, false otherwise
 */
export const hasFirebaseConfig = Boolean(
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
);

// ============================================================================
// FIRESTORE HELPER FUNCTIONS
// ============================================================================

/**
 * Subscribe to help requests with real-time updates
 * Returns an unsubscribe function to stop listening
 *
 * @param {Function} callback - Callback function to receive updates
 * @param {Object} options - Options for filtering results
 * @param {string} [options.category] - Filter by category
 * @param {string} [options.status='active'] - Filter by status
 * @returns {Function} Unsubscribe function to stop listening
 *
 * @example
 * const unsubscribe = fetchHelpRequestsRealTime((requests) => {
 *   console.log('Updated requests:', requests);
 * });
 * // Later, to stop listening:
 * unsubscribe();
 */
export function fetchHelpRequestsRealTime(callback, options = {}) {
  try {
    const db = getFirestoreInstance();
    const { category, status = "active" } = options;

    // Build query
    let q = query(
      collection(db, "helpRequests"),
      where("status", "==", status),
      orderBy("createdAt", "desc"),
    );

    // Add category filter if provided
    if (category) {
      q = query(
        collection(db, "helpRequests"),
        where("status", "==", status),
        where("category", "==", category),
        orderBy("createdAt", "desc"),
      );
    }

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requests = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          requests.push({
            id: doc.id,
            ...data,
            // Convert Firestore Timestamp to Date
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate()
              : new Date(),
            updatedAt: data.updatedAt?.toDate
              ? data.updatedAt.toDate()
              : new Date(),
          });
        });
        callback(requests);
      },
      (error) => {
        console.error("[fetchHelpRequestsRealTime] Error:", error);
        callback([]); // Return empty array on error
      },
    );

    return unsubscribe;
  } catch (error) {
    console.error(
      "[fetchHelpRequestsRealTime] Failed to set up listener:",
      error,
    );
    // Return a no-op unsubscribe function
    return () => {};
  }
}

/**
 * Add a new help request to Firestore
 *
 * @param {Object} data - Help request data
 * @param {string} data.title - Request title
 * @param {string} data.category - Request category
 * @param {string} data.description - Request description
 * @param {string} data.location - Request location
 * @param {boolean} [data.isReturnNeeded] - Whether return is needed
 * @param {boolean} [data.urgent] - Whether request is urgent
 * @param {string} userId - ID of the user creating the request
 * @param {string} userEmail - Email of the user creating the request
 * @param {string} userName - Name of the user creating the request
 * @returns {Promise<string>} Promise resolving to the document ID
 * @throws {Error} If the operation fails
 *
 * @example
 * const requestId = await addHelpRequest({
 *   title: 'Need help moving',
 *   category: 'other',
 *   description: 'Need help moving furniture',
 *   location: 'A4 Building'
 * }, userId, userEmail, userName);
 */
export async function addHelpRequest(data, userId, userEmail, userName) {
  try {
    const db = getFirestoreInstance();
    const now = Timestamp.now();

    const requestData = {
      title: data.title,
      category: data.category,
      description: data.description || "",
      location: data.location,
      isReturnNeeded: data.isReturnNeeded || false,
      urgent: data.urgent || false,
      userId,
      userEmail,
      userName: userName || "Anonymous",
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, "helpRequests"), requestData);
    log("✓ Help request created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("[addHelpRequest] Failed to create help request:", error);
    throw new Error(`Failed to create help request: ${error.message}`);
  }
}

/**
 * Subscribe to questions with real-time updates
 *
 * @param {Function} callback - Callback function to receive updates
 * @param {Object} options - Options for filtering results
 * @param {string} [options.status='open'] - Filter by status
 * @returns {Function} Unsubscribe function to stop listening
 *
 * @example
 * const unsubscribe = fetchQuestionsRealTime((questions) => {
 *   console.log('Updated questions:', questions);
 * });
 */
export function fetchQuestionsRealTime(callback, options = {}) {
  try {
    const db = getFirestoreInstance();
    const { status = "open" } = options;

    const q = query(
      collection(db, "questions"),
      where("status", "==", status),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const questions = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          questions.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate()
              : new Date(),
            updatedAt: data.updatedAt?.toDate
              ? data.updatedAt.toDate()
              : new Date(),
          });
        });
        callback(questions);
      },
      (error) => {
        console.error("[fetchQuestionsRealTime] Error:", error);
        callback([]);
      },
    );

    return unsubscribe;
  } catch (error) {
    console.error("[fetchQuestionsRealTime] Failed to set up listener:", error);
    return () => {};
  }
}

/**
 * Add a new question to Firestore
 *
 * @param {Object} data - Question data
 * @param {string} data.title - Question title
 * @param {string} data.content - Question content
 * @param {string[]} [data.tags] - Question tags
 * @param {string} userId - ID of the user asking the question
 * @param {string} userEmail - Email of the user
 * @param {string} userName - Name of the user
 * @returns {Promise<string>} Promise resolving to the document ID
 * @throws {Error} If the operation fails
 */
export async function addQuestion(data, userId, userEmail, userName) {
  try {
    const db = getFirestoreInstance();
    const now = Timestamp.now();

    const questionData = {
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      userId,
      userEmail,
      userName: userName || "Anonymous",
      status: "open",
      answerCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, "questions"), questionData);
    log("✓ Question created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("[addQuestion] Failed to create question:", error);
    throw new Error(`Failed to create question: ${error.message}`);
  }
}

/**
 * Test Firebase connection and configuration
 * Useful for validating that Firebase is properly set up
 *
 * @returns {Promise<Object>} Promise resolving to connection status
 *
 * @example
 * const status = await testFirebaseConnection();
 * console.log('Firebase status:', status);
 */
export async function testFirebaseConnection() {
  try {
    log("Testing Firebase connection...");

    // Try to get Auth instance
    const auth = getAuthInstance();
    log("✓ Auth connection successful");

    // Try to get Firestore instance
    const db = getFirestoreInstance();
    log("✓ Firestore connection successful");

    return {
      success: true,
      auth: !!auth,
      firestore: !!db,
      message: "Firebase is properly configured and connected",
    };
  } catch (error) {
    console.error("[testFirebaseConnection] Connection test failed:", error);
    return {
      success: false,
      auth: false,
      firestore: false,
      error: error.message,
      message: "Firebase connection failed. Check your configuration.",
    };
  }
}
