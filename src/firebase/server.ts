
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// This is a server-side only file.

let adminApp: App;

if (getApps().length === 0) {
  adminApp = initializeApp({
    // Explicitly use the project ID from the client-side config.
    // In a real production environment, you might use environment variables
    // for credentials, but this is robust for local/dev environments.
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
