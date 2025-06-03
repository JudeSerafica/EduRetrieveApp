import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWaApRm41MmBEB2-INOaYz6lMbNkZ_WF4",
  authDomain: "eduretrieve-4e1c0.firebaseapp.com",
  projectId: "eduretrieve-4e1c0",
  storageBucket: "eduretrieve-4e1c0.firebasestorage.app",
  messagingSenderId: "361479179209",
  appId: "1:361479179209:web:dc9ff450d82ef5f2303618",
  measurementId: "G-N8WMNKPZV3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };