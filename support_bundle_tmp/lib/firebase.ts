/**
 * Unified Firebase access.
 * In Preview, reuses the globals created in index.html.
 * In build/local, initialises from window.__FIREBASE_CONFIG__ if present.
 */
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

let _app: FirebaseApp;

function initialize(): FirebaseApp {
  // This function will only be called once.
  if (_app) return _app;

  // Prefer the preview globals (set by index.html).
  const w = window as any;
  if (w.__FIREBASE_APP__) {
    _app = w.__FIREBASE_APP__;
    return _app;
  }

  if (getApps().length) {
    _app = getApps()[0];
    return _app;
  }
  
  const cfg = w.__FIREBASE_CONFIG__;
  if (!cfg) {
    throw new Error("Missing Firebase config (window.__FIREBASE_CONFIG__).");
  }

  _app = initializeApp(cfg);
  w.__FIREBASE_APP__ = _app; // Store it for subsequent calls

  return _app;
}

export const app = initialize();

// For compatibility with any other components that might still use getFirebase()
export async function getFirebase() {
    return {
        app,
        auth: getAuth(app),
        db: getFirestore(app),
        storage: getStorage(app),
    };
}
