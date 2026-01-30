import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCBszP4bWuZyMYGfWqb_5WuMJxlDyc9M4E",
  authDomain: "alon-terminal.firebaseapp.com",
  projectId: "alon-terminal",
  storageBucket: "alon-terminal.firebasestorage.app",
  messagingSenderId: "950262637032",
  appId: "1:950262637032:web:eb8a7ebdc47c6839f0445d"
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
export const db = getFirestore(app);
