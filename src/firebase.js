import { initializeApp } from 'firebase/app';
import { getFirestore, collection } from "firebase/firestore";
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyApM9o_fxs0mfD4j_iaq9CzVhIlga9b2Qk",

  authDomain: "ecomap-2025.firebaseapp.com",

  projectId: "ecomap-2025",

  storageBucket: "ecomap-2025.firebasestorage.app",

  messagingSenderId: "456954257660",

  appId: "1:456954257660:web:a3eb1b5662f72436d0b779"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const ecoPointsCollection = collection(db, "ecoPoints");