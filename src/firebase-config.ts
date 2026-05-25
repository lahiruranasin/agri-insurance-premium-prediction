/**
 * Firebase Configuration for Frontend
 * Initializes Firebase Auth, Firestore, Storage
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from test.js
const firebaseConfig = {
  apiKey: "AIzaSyCK0CkATz1tbq9kDqX1cPXoImMRUAmAFyc",
  authDomain: "finalproject-96580.firebaseapp.com",
  projectId: "finalproject-96580",
  storageBucket: "finalproject-96580.firebasestorage.app",
  messagingSenderId: "332053131152",
  appId: "1:332053131152:web:d0446b7bf912b987f4cd15",
  measurementId: "G-EE9KX12Y40"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Backend API URL
export const BACKEND_URL = "http://localhost:8500";

export default app;
