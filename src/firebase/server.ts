
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';
import { getAuth as getClientAuth, initializeApp as initializeClientApp } from 'firebase/auth';

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

// We need a client app on the server for auth operations like password validation
const clientApp = initializeClientApp(firebaseConfig);
const clientAuth = getClientAuth(clientApp);


export function getFirebase() {
  return { firestore, app: adminApp, auth: clientAuth };
}

    