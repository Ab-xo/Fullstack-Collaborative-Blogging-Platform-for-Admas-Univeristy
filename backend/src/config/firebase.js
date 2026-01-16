import admin from "firebase-admin";

let firebaseInitialized = false;
let firebaseAdmin = null;

export const initializeFirebase = () => {
  try {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      return null;
    }

    if (firebaseInitialized) return firebaseAdmin;

    let privateKey = process.env.FIREBASE_PRIVATE_KEY
      .replace(/^["']|["']$/g, '')
      .replace(/\\n/g, '\n')
      .trim();

    if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
      return null;
    }

    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "auto-generated",
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID || "auto-generated",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`,
      universe_domain: "googleapis.com"
    };

    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    firebaseInitialized = true;
    return firebaseAdmin;
  } catch (error) {
    return null;
  }
};

export const getFirebaseAdmin = () => {
  if (!firebaseInitialized) return initializeFirebase();
  return firebaseAdmin;
};

export const verifyFirebaseToken = async (idToken) => {
  try {
    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) return { success: false, error: "Firebase not configured" };
    const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
    return { success: true, user: decoded };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const getFirebaseUser = async (uid) => {
  try {
    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) return { success: false, error: "Firebase not configured" };
    const user = await firebaseAdmin.auth().getUser(uid);
    return { success: true, user };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const createCustomToken = async (uid, claims = {}) => {
  try {
    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) return { success: false, error: "Firebase not configured" };
    const token = await firebaseAdmin.auth().createCustomToken(uid, claims);
    return { success: true, token };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const isFirebaseConfigured = () => firebaseInitialized;

export default admin;