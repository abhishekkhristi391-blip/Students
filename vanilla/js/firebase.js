// Firebase initialization (mirrors src/lib/firebase.ts)
//
// This is the ONLY file that names the Firebase CDN. Everything else imports
// from here with a relative path, which means:
//   - no import map, so no inline <script>, so nothing for CSP to block
//   - one place to bump the version
// The URLs must stay in sync with each other; firebase-auth.js and
// firebase-firestore.js both load the shared runtime from the same path.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAj3Z0Dv5q3ZR31WezZW2n3Wiaxzz4sk6U",
  authDomain: "students-d2341.firebaseapp.com",
  databaseURL: "https://students-d2341-default-rtdb.firebaseio.com",
  projectId: "students-d2341",
  storageBucket: "students-d2341.firebasestorage.app",
  messagingSenderId: "473088819993",
  appId: "1:473088819993:web:b6638183e10bf977007b88",
  measurementId: "G-GS7XWDMK6C"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// Re-exported so the rest of the app never needs a bare "firebase/*" specifier.
// A bare specifier is only resolvable via an import map, and an import map has
// to be inline, which is exactly what script-src blocks.
export {
  onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

export {
  doc, getDoc, setDoc, updateDoc, writeBatch, onSnapshot, increment, serverTimestamp,
  collection, addDoc, query, where, orderBy, limit, getCountFromServer, getDocs,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";