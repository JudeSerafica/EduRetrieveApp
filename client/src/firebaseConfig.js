import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBg5OqXtuZrYV5qUQQ_xd7mLSae58epzsc",
  authDomain: "eduretrieve-4b630.firebaseapp.com",
  projectId: "eduretrieve-4b630",
  storageBucket: "eduretrieve-4b630.firebasestorage.app",
  messagingSenderId: "362023692609",
  appId: "1:362023692609:web:8cbc83b0160bed59d619c0",
  measurementId: "G-8DM3F2YK49"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics };