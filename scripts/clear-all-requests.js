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

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env.local file not found');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
}

loadEnvFile();

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Delete all documents in a collection
 */
async function clearCollection(collectionName) {
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
    let totalDeleted = 0;

    // Clear help requests
    totalDeleted += await clearCollection('helpRequests');
    
    // Clear chats (this will also clear subcollection messages automatically)
    totalDeleted += await clearCollection('chats');

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
