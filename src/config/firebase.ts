import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCMnNJgknRgDpd16bW-J1xC3ba5rqOb0ys",
  authDomain: "smartmarket-3a6bd.firebaseapp.com",
  projectId: "smartmarket-3a6bd",
  storageBucket: "smartmarket-3a6bd.firebasestorage.app",
  messagingSenderId: "425083044183",
  appId: "1:425083044183:web:a2a882385fd42885b8be12",
  measurementId: "G-LDRVQ4RXJB"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

// Messaging - sadece destekleniyorsa
export const messaging = (async () => {
  try {
    const isSupportedBrowser = await isSupported();
    if (isSupportedBrowser) {
      return getMessaging(app);
    }
    console.log('⚠️ Firebase Messaging is not supported in this browser');
    return null;
  } catch (err) {
    console.error('❌ Firebase Messaging error:', err);
    return null;
  }
})();