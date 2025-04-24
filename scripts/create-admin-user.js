// Script to add an admin user to Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase configuration - replace with your project config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Read UID from command line arguments
const uid = process.argv[2];
const email = process.argv[3];

if (!uid || !email) {
  console.error('Usage: node create-admin-user.js <uid> <email>');
  console.error('Example: node create-admin-user.js 123456abcdef user@example.com');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createAdminUser() {
  try {
    const adminUserRef = doc(db, 'adminUsers', uid);
    
    await setDoc(adminUserRef, {
      id: uid,
      email: email,
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date()
    });
    
    console.log(`✅ Admin user created successfully with UID: ${uid}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser(); 