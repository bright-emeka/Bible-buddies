// src/firebaseClient.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCj7vAwDZKkqlf1e9kLko4ztol6ofxvwOc", // From your screenshot
  authDomain: "faith-social-ef895.firebaseapp.com",
  projectId: "faith-social-ef895",
  storageBucket: "faith-social-ef895.firebasestorage.app",
  messagingSenderId: "485831767405",
  appId: "1:485831767405:web:9fa4e7ad111cde6951d664"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);