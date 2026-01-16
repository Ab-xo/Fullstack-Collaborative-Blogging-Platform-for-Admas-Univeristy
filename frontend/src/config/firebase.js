import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Firebase configuration - EXACT match from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyD6JRbJI4zfJ6xpIZwc7DisD3aHPzPSXS8",
  authDomain: "admas-blog.firebaseapp.com",
  databaseURL: "https://admas-blog-default-rtdb.firebaseio.com",
  projectId: "admas-blog",
  storageBucket: "admas-blog.firebasestorage.app",
  messagingSenderId: "1008280273110",
  appId: "1:1008280273110:web:10ed6f202d475680270977",
  measurementId: "G-3C86M0SHZT"
};

// Debug: Log configuration
console.log('🔥 Firebase Config Debug:');
console.log('API Key:', firebaseConfig.apiKey ? '✅ Present' : '❌ Missing');
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('Project ID:', firebaseConfig.projectId);
console.log('Storage Bucket:', firebaseConfig.storageBucket);
console.log('Messaging Sender ID:', firebaseConfig.messagingSenderId);
console.log('App ID:', firebaseConfig.appId);
console.log('Database URL:', firebaseConfig.databaseURL);
console.log('Measurement ID:', firebaseConfig.measurementId);

// Validate config
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration is incomplete!');
  console.error('Missing required fields:', {
    apiKey: !firebaseConfig.apiKey,
    authDomain: !firebaseConfig.authDomain,
    projectId: !firebaseConfig.projectId,
  });
}

console.log('🔥 Firebase Config Object:', firebaseConfig);

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

// Initialize Firebase Authentication
let auth;
try {
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized successfully');
} catch (error) {
  console.error('❌ Firebase Auth initialization error:', error);
  throw error;
}

// Set persistence to LOCAL so user stays logged in
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting persistence:', error);
});

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

console.log('✅ Google Auth Provider initialized');

export { auth, googleProvider };
export default app;
