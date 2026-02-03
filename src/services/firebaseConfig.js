import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAGbyxvviVcs7ebtCCAMdldqce0VbCDdUA",
    authDomain: "study-craft-ai.firebaseapp.com",
    projectId: "study-craft-ai",
    storageBucket: "study-craft-ai.firebasestorage.app",
    messagingSenderId: "825734322226",
    appId: "1:825734322226:web:d9780f2d8481d8825dc42b",
    measurementId: "G-BD2H64YEC8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;

