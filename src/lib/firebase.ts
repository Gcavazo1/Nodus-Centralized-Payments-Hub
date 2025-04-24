import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import type { Analytics } from 'firebase/analytics'; // Import type only

// Your web app's Firebase configuration
// Use environment variables for sensitive information
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'YOUR_APP_ID',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'YOUR_MEASUREMENT_ID'
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Check if Firebase is configured (useful for template users)
const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                           process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'YOUR_API_KEY';

// Analytics instance (lazily initialized)
let analyticsInstance: Analytics | null = null;

/**
 * Initializes and returns the Firebase Analytics instance.
 * Ensures initialization only happens client-side and only once.
 * @returns {Analytics | null} The Analytics instance or null if not configured/supported.
 */
export const getAnalyticsInstance = async (): Promise<Analytics | null> => {
  if (analyticsInstance) {
    return analyticsInstance;
  }

  if (isFirebaseConfigured && typeof window !== 'undefined') {
    try {
      const { getAnalytics, isSupported } = await import('firebase/analytics');
      const supported = await isSupported();
      if (supported) {
        analyticsInstance = getAnalytics(app);
        console.log("Firebase Analytics initialized.");
        return analyticsInstance;
      }
    } catch (error) {
      console.warn("Firebase Analytics initialization failed:", error);
    }
  }
  
  return null; // Return null if not configured, not supported, or SSR
};

export { app, db, auth, storage, isFirebaseConfigured };
