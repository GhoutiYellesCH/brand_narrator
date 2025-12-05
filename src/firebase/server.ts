
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// This is a server-side only file.

let adminApp: App;

// The previous logic was attempting to initialize without credentials,
// which fails in many environments. This new logic ensures that the
// Admin SDK is always initialized with the correct project ID, which
// is a more robust method for server-side environments.
if (getApps().length === 0) {
  adminApp = initializeApp({
    projectId: firebaseConfig.projectId,
  });
} else {
  adminApp = getApp();
}


const auth = getAuth(adminApp);
const firestore = getFirestore(adminApp);

export function getFirebase() {
  return { auth, firestore, app: adminApp };
}
