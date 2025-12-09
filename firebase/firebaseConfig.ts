import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import Constants from "expo-constants";

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredKeys = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID'
  ];

  const missingKeys = requiredKeys.filter(key => {
    const value = Constants.expoConfig?.extra?.[key] || process.env[key];
    return !value || value.includes('your_') || value.includes('_here');
  });

  if (missingKeys.length > 0) {
    console.warn(
      `Firebase configuration warning: Missing or invalid values for: ${missingKeys.join(', ')}\n` +
      'Please set these environment variables in your .env file or repository secrets.\n' +
      'App will run in demo mode without authentication.'
    );
    return false;
  }
  return true;
};

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
};

// Check if configuration is valid
const isConfigValid = validateFirebaseConfig();

// Initialize Firebase only if config is valid
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

try {
  if (isConfigValid) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } else {
    console.warn('Firebase not initialized due to missing configuration');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export { auth };
export default app;
