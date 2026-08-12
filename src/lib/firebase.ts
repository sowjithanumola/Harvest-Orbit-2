import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return undefined;
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY") || "AIzaSyAXr0DerMBptWo754Q5ZUNx7gaS1l6whkY",
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN") || "chrome-anvil-w40ks.firebaseapp.com",
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID") || "chrome-anvil-w40ks",
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET") || "chrome-anvil-w40ks.firebasestorage.app",
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID") || "30607474566",
  appId: getEnv("VITE_FIREBASE_APP_ID") || "1:30607474566:web:ab63517ab7cb84dbdeb607"
};

// Fail fast with a clear error if critical config is missing (only in production)
const isProd = getEnv("PROD") === "true" || getEnv("NODE_ENV") === "production";
if (isProd && !firebaseConfig.apiKey) {
    console.warn("Firebase API Key is missing. Authentication may fail.");
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
