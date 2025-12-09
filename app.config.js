const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      // Read from EXPO_PUBLIC_* environment variables
      FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
      FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
      FIREBASE_STORAGE_BUCKET:
        process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
      FIREBASE_MESSAGING_SENDER_ID:
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
      FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
    },
  };
};
