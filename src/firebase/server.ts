
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// This is a server-side only file.

let adminApp: App;

if (getApps().length === 0) {
  adminApp = initializeApp({
    projectId: firebaseConfig.projectId,
  });
} else {
  adminApp = getApp();
}

const firestore = getFirestore(adminApp);

export function getFirebase() {
  // Note: The 'auth' export has been removed as we are no longer using Firebase Admin for Auth.
  return { firestore, app: adminApp };
}
