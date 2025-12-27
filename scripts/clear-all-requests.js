/**
 * Clear All Help Requests - Development Script
 * 
 * This script deletes all documents from the helpRequests and chats collections
 * in Firestore. Use this to start fresh with clean data.
 * 
 * ⚠️ WARNING: This operation is irreversible!
 * 
 * Usage:
 *   node scripts/clear-all-requests.js
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env.local file
const result = dotenv.config({
  path: path.join(__dirname, '..', '.env.local'),
});

if (result.error) {
  console.error('❌ Error loading .env.local file:', result.error.message);
  console.log('\nMake sure you have a .env.local file in the project root.');
  process.exit(1);
}

// Import Firebase modules dynamically
let initializeApp, getFirestore, collection, getDocs, deleteDoc, doc;

async function loadFirebase() {
  const firebase = await import('firebase/app');
  const firestore = await import('firebase/firestore');
  
  initializeApp = firebase.initializeApp;
  getFirestore = firestore.getFirestore;
  collection = firestore.collection;
  getDocs = firestore.getDocs;
  deleteDoc = firestore.deleteDoc;
  doc = firestore.doc;
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Validate configuration
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error('❌ Missing Firebase configuration:');
  missingKeys.forEach(key => console.error(`   - ${key}`));
  process.exit(1);
}

/**
 * Delete all documents in a collection
 */
async function clearCollection(db, collectionName) {
  console.log(`\n🗑️  Clearing collection: ${collectionName}`);
  
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    console.log(`   Found ${snapshot.size} documents`);
    
    if (snapshot.size === 0) {
      console.log('   ✓ Collection is already empty');
      return 0;
    }

    let deleted = 0;
    const deletePromises = [];
    
    snapshot.forEach((document) => {
      deletePromises.push(
        deleteDoc(doc(db, collectionName, document.id))
          .then(() => {
            deleted++;
            process.stdout.write(`\r   Deleting... ${deleted}/${snapshot.size}`);
          })
      );
    });

    await Promise.all(deletePromises);
    console.log(`\n   ✓ Deleted ${deleted} documents`);
    return deleted;
  } catch (error) {
    console.error(`   ❌ Error clearing ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  Clear All Help Requests & Chats Data     ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('\n⚠️  WARNING: This will delete ALL data!');
  console.log('   - All help requests will be deleted');
  console.log('   - All chats and messages will be deleted');
  console.log('   - This operation is IRREVERSIBLE\n');

  try {
    // Load Firebase modules
    await loadFirebase();
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    let totalDeleted = 0;

    // Clear help requests
    totalDeleted += await clearCollection(db, 'helpRequests');
    
    // Clear chats (this will also clear subcollection messages automatically)
    totalDeleted += await clearCollection(db, 'chats');

    console.log('\n╔════════════════════════════════════════════╗');
    console.log(`║  ✓ SUCCESS: Deleted ${totalDeleted} documents total     ║`);
    console.log('╚════════════════════════════════════════════╝');
    console.log('\nYou can now start fresh with clean data! 🎉\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Operation failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
