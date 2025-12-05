import { getApps, initializeApp, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// This is a server-side only file.

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    // When running in a Google Cloud environment, the GOOGLE_APPLICATION_CREDENTIALS
    // environment variable is automatically set. Firebase Admin SDK can use this
    // to initialize without any config.
    try {
      return initializeApp();
    } catch (e) {
       console.warn('Admin SDK automatic initialization failed. Falling back to client config.', e);
       // Fallback for local development or other environments
       return initializeApp({
         credential: undefined, // Let SDK find from env vars if possible
         projectId: firebaseConfig.projectId,
       });
    }
  }
  return getApp();
}

const adminApp = initializeFirebaseAdmin();
const auth = getAuth(adminApp);
const firestore = getFirestore(adminApp);

export function getFirebase() {
  return { auth, firestore, app: adminApp };
}

    