/**
 * Firebase Connection Test Script
 *
 * This script validates that Firebase is properly configured and can connect.
 * Run this to verify your .env.local file is set up correctly.
 *
 * Usage:
 *   node scripts/test-firebase-connection.js
 *
 * Note: This is a Node.js script for testing purposes. The actual Firebase
 * connection in the app happens through the Expo/React Native environment.
 */

const dotenv = require("dotenv");
const path = require("path");

// Load .env.local file
const result = dotenv.config({
  path: path.join(__dirname, "..", ".env.local"),
});

if (result.error) {
  console.error("❌ Error loading .env.local file:", result.error.message);
  console.log("\nMake sure you have a .env.local file in the project root.");
  console.log(
    "Copy .env.example to .env.local and fill in your Firebase credentials.",
  );
  process.exit(1);
}

console.log("🔍 Testing Firebase Configuration...\n");

// Check all required environment variables
const requiredVars = [
  "EXPO_PUBLIC_FIREBASE_API_KEY",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "EXPO_PUBLIC_FIREBASE_APP_ID",
];

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let hasErrors = false;

// Check each variable
console.log("📋 Checking environment variables:\n");

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  const configKey = varName.replace("EXPO_PUBLIC_FIREBASE_", "").toLowerCase();
  const displayKey =
    configKey.charAt(0).toUpperCase() + configKey.slice(1).replace(/_/g, " ");

  if (!value || value.trim() === "") {
    console.log(`  ❌ ${displayKey}: MISSING`);
    hasErrors = true;
  } else {
    // Show partial value for security
    const displayValue =
      value.length > 20 ? `${value.substring(0, 15)}...` : value;
    console.log(`  ✅ ${displayKey}: ${displayValue}`);
  }
});

console.log("\n");

// Validate format of certain fields
if (config.authDomain && !config.authDomain.includes(".firebaseapp.com")) {
  console.log("  ⚠️  Warning: Auth Domain should end with .firebaseapp.com");
  console.log(`     Current value: ${config.authDomain}\n`);
}

if (
  config.storageBucket &&
  !config.storageBucket.includes(".firebasestorage.app") &&
  !config.storageBucket.includes(".appspot.com")
) {
  console.log(
    "  ⚠️  Warning: Storage Bucket should end with .firebasestorage.app or .appspot.com",
  );
  console.log(`     Current value: ${config.storageBucket}\n`);
}

if (config.appId && !config.appId.includes(":")) {
  console.log(
    "  ⚠️  Warning: App ID should contain colons (format: 1:xxx:web:xxx)",
  );
  console.log(`     Current value: ${config.appId}\n`);
}

// Final result
console.log("─".repeat(60));
if (hasErrors) {
  console.log("\n❌ Configuration is INCOMPLETE\n");
  console.log("Please set all required environment variables in .env.local");
  console.log("See .env.example for the required format.\n");
  process.exit(1);
} else {
  console.log("\n✅ Configuration looks good!\n");
  console.log("All required environment variables are set.");
  console.log("You can now run the app with: npm start\n");
  console.log("Note: This script only validates that variables are set.");
  console.log("Actual Firebase connectivity is tested when you run the app.\n");
  process.exit(0);
}
