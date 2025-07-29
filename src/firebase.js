import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqQRrHpPbeAIL7GFlA-X8hAYXrwK7c3-k",
  authDomain: "tic-tac-toe-c2720.firebaseapp.com",
  projectId: "tic-tac-toe-c2720",
  storageBucket: "tic-tac-toe-c2720.firebasestorage.app",
  messagingSenderId: "895693682697",
  appId: "1:895693682697:web:d2e9b197853ce0dac760d8",
  measurementId: "G-168VRY7LK2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics (optional)
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.log('Analytics not available:', error);
}

// Log Firebase initialization for debugging
console.log('Firebase initialized with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

export default app; 