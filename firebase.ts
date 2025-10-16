import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';

// Extract and validate required environment variables
const {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID,
} = import.meta.env as Record<string, string | undefined>;

const missing = Object.entries({
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID,
}).filter(([, v]) => !v);

// Check if Firebase is configured
const isConfigured = missing.length === 0;

if (!isConfigured) {
  const keys = missing.map(([k]) => k).join(', ');
  console.error(
    `⚠️ Missing Firebase environment variables: ${keys}\n\n` +
    `📝 To fix this:\n` +
    `   1. Create/edit .env.local in your project root\n` +
    `   2. Add your Firebase configuration:\n\n` +
    `   VITE_FIREBASE_API_KEY=your_api_key\n` +
    `   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com\n` +
    `   VITE_FIREBASE_PROJECT_ID=your-project-id\n` +
    `   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com\n` +
    `   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id\n` +
    `   VITE_FIREBASE_APP_ID=your_app_id\n\n` +
    `   3. Get credentials from: https://console.firebase.google.com/\n` +
    `   4. Restart your dev server\n\n` +
    `📖 See QUICK_START.md or FIREBASE_SECURITY_SETUP.md for detailed instructions.`
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isConfigured) {
  app = initializeApp({
    apiKey: VITE_FIREBASE_API_KEY,
    authDomain: VITE_FIREBASE_AUTH_DOMAIN,
    projectId: VITE_FIREBASE_PROJECT_ID,
    storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: VITE_FIREBASE_APP_ID,
  });

  try {
    auth = getAuth(app);
    
    // Initialize Firestore with ignoreUndefinedProperties
    db = initializeFirestore(app, {
      ignoreUndefinedProperties: true,
    });

    // Configure auth settings for email verification
    if (auth) {
      auth.useDeviceLanguage(); // Use the device's language for emails
      
      // Set custom settings for actions like password reset and email verification
      const actionCodeSettings = {
        url: window.location.origin + '/profile',
        handleCodeInApp: false
      };
      
      // Store actionCodeSettings in localStorage for use in components
      localStorage.setItem('firebaseActionCodeSettings', JSON.stringify(actionCodeSettings));
    }
    
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error; // Re-throw to prevent silent failures
  }
}

// Export with null checks
export { auth, db, isConfigured };

// Helper to check if Firebase is ready
export const isFirebaseReady = () => {
  return isConfigured && app !== null && auth !== null && db !== null;
};
