import { initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Cached instances
let appInstance: App | null = null;
let firestoreInstance: Firestore | null = null;

/**
 * Initializes the Firebase Admin SDK if not already initialized.
 * Reads credentials directly from the FIREBASE_SERVICE_ACCOUNT_JSON environment variable.
 * Implements a singleton pattern to avoid multiple initializations.
 * 
 * @returns {Promise<App>} A promise that resolves with the initialized Firebase Admin App instance.
 * @throws {Error} If the FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set or is invalid JSON.
 * @throws {Error} If Firebase Admin SDK initialization fails.
 */
async function initializeAdminApp(): Promise<App> {
  if (appInstance) {
    console.log('[firebase-admin] Using cached Admin App instance.');
    return appInstance;
  }

  console.log('[firebase-admin] Initializing Firebase Admin SDK...');
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
  }

  console.log('[firebase-admin] Raw FIREBASE_SERVICE_ACCOUNT_JSON content:', serviceAccountJson);

  let serviceAccountCredentials;
  try {
    serviceAccountCredentials = JSON.parse(serviceAccountJson);
    // Basic validation of the parsed object
    if (!serviceAccountCredentials.project_id || !serviceAccountCredentials.private_key || !serviceAccountCredentials.client_email) {
      throw new Error('Invalid service account JSON structure.');
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[firebase-admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', message);
    throw new Error(`Failed to parse service account JSON: ${message}`);
  }

  try {
    console.log(`[firebase-admin] Initializing with Project ID: ${serviceAccountCredentials.project_id}`);
    appInstance = initializeApp({
      credential: cert(serviceAccountCredentials),
      // Optional: Specify database URL if needed, usually inferred
      // databaseURL: `https://${serviceAccountCredentials.project_id}.firebaseio.com` 
    }, 'admin-app-' + Date.now()); // Use a unique name to avoid conflicts if called rapidly

    console.log('[firebase-admin] Firebase Admin SDK initialized successfully.');
    return appInstance;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown initialization error';
    console.error('[firebase-admin] Firebase Admin SDK initialization failed:', error);
    // Log the specific credential being used (excluding private key for security)
    console.error('[firebase-admin] Credentials used (partial):', {
      project_id: serviceAccountCredentials.project_id,
      client_email: serviceAccountCredentials.client_email,
    });
    throw new Error(`Firebase Admin SDK initialization failed: ${message}`);
  }
}

/**
 * Gets the initialized Firebase Admin Firestore instance.
 * Initializes the Admin App if necessary.
 * 
 * @returns {Promise<Firestore>} A promise that resolves with the Firestore instance.
 * @throws {Error} If initialization fails.
 */
export async function getAdminFirestoreInstance(): Promise<Firestore> {
  if (firestoreInstance) {
    console.log('[firebase-admin] Using cached Firestore Admin instance.');
    return firestoreInstance;
  }

  console.log('[firebase-admin] Getting Firestore Admin instance...');
  try {
    // Ensure the app is initialized and get the instance
    const app = await initializeAdminApp(); 
    // Pass the specific app instance to getFirestore
    firestoreInstance = getFirestore(app); 
    console.log('[firebase-admin] Firestore Admin instance obtained successfully.');
    return firestoreInstance;
  } catch (error) {
    console.error('[firebase-admin] Failed to get Firestore Admin instance:', error);
    throw error; 
  }
}

// Immediately attempt to initialize on module load (optional, can be done on first request)
// initializeAdminApp().catch(error => {
//   console.error('[firebase-admin] Initial automatic initialization failed:', error);
// }); 