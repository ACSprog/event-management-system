/**
 * Firebase for the web app.
 *
 * Config comes from NEXT_PUBLIC_FIREBASE_* variables set at build time, so each
 * environment uses its own project: the test build points at
 * event-management-system-test, and the owner sets their own values for live.
 * If the variables are missing (for example local development), Firebase is
 * not started at all.
 *
 * These values identify the project; they are not secrets. Protect the project
 * by restricting the API key to your domains in the Google Cloud console.
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const firebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

export function firebaseApp(): FirebaseApp | null {
  if (!firebaseConfigured || typeof window === "undefined") return null;
  return getApps().length ? getApp() : initializeApp(config);
}

/** Starts Google Analytics once, in the browser, when the project has it enabled. */
export async function startAnalytics() {
  const app = firebaseApp();
  if (!app || !config.measurementId) return null;
  const { getAnalytics, isSupported } = await import("firebase/analytics");
  return (await isSupported()) ? getAnalytics(app) : null;
}
