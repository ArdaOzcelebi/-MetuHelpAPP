/**
 * Test script for useCampusStats hook
 * This script verifies that the Firebase queries for campus statistics work correctly
 */

const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
const result = dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

if (result.error) {
  console.error("❌ Failed to load .env.local file:", result.error);
  process.exit(1);
}

// Import Firebase after environment is loaded
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  query,
  where,
  getCountFromServer,
  Timestamp,
} = require("firebase/firestore");

async function testCampusStats() {
  console.log("\n🧪 Testing Campus Statistics Queries\n");
  console.log("=====================================\n");

  try {
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    };

    console.log("📡 Connecting to Firebase...");
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log("✅ Connected to Firestore\n");

    // Get the start of today (midnight)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayTimestamp = Timestamp.fromDate(startOfToday);

    console.log("📊 Testing Global Statistics:\n");

    // Test 1: Active Requests
    console.log("1️⃣  Testing Active Requests query...");
    const activeRequestsQuery = query(
      collection(db, "helpRequests"),
      where("status", "==", "active"),
    );
    const activeRequestsSnapshot = await getCountFromServer(
      activeRequestsQuery,
    );
    const activeRequestsCount = activeRequestsSnapshot.data().count;
    console.log(`   ✅ Active Requests: ${activeRequestsCount}\n`);

    // Test 2: Helped Today
    console.log("2️⃣  Testing Helped Today query...");
    console.log(`   📅 Start of today: ${startOfToday.toISOString()}`);
    const helpedTodayQuery = query(
      collection(db, "helpRequests"),
      where("status", "==", "fulfilled"),
      where("updatedAt", ">=", startOfTodayTimestamp),
    );
    const helpedTodaySnapshot = await getCountFromServer(helpedTodayQuery);
    const helpedTodayCount = helpedTodaySnapshot.data().count;
    console.log(`   ✅ Helped Today: ${helpedTodayCount}\n`);

    console.log("=====================================\n");
    console.log("📈 Summary:");
    console.log(`   • Active Requests: ${activeRequestsCount}`);
    console.log(`   • Helped Today: ${helpedTodayCount}`);
    console.log("\n✅ All queries executed successfully!");
    console.log(
      "\nℹ️  Note: Personal stats (Requests Posted, Help Given) require a user ID",
    );
    console.log("   and will be tested when a user is logged in.\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error testing campus stats:");
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testCampusStats();
