import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// Check for environment variables
// In Expo, process.env variables need to be defined at build time
// For development without Firebase setup, we use demo values
const hasFirebaseConfig =
  process.env.FIREBASE_API_KEY && process.env.FIREBASE_PROJECT_ID;

if (!hasFirebaseConfig) {
  console.warn("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.warn("⚠️  Firebase environment variables not configured");
  console.warn("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.warn("");
  console.warn("The app will run in demo mode.");
  console.warn("To enable authentication:");
  console.warn("1. Create a .env file based on .env.example");
  console.warn("2. Add your Firebase configuration");
  console.warn("3. Rebuild the app");
  console.warn("");
  console.warn("For Vercel/web deployments, set environment");
  console.warn("variables in your deployment platform.");
  console.warn("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

// Firebase configuration from environment variables
// Use demo values to prevent app crash when env vars are missing
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDemo-Replace-With-Real-Key",
  authDomain:
    process.env.FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "demo-project-id",
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId:
    process.env.FIREBASE_APP_ID || "1:123456789:web:demo-app-id-replace-me",
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  if (!hasFirebaseConfig) {
    console.warn("Firebase initialized with demo configuration");
    console.warn("Authentication features will not work");
  }
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  throw new Error(
    "Firebase initialization failed. Please check your configuration.",
  );
}

export { auth, hasFirebaseConfig };
