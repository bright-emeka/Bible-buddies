import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics"; 

const firebaseConfig = {
  apiKey: "AIzaSyCj7vAwDZKkqlf1e9kLko4ztol6ofxvwOc",
  authDomain: "faith-social-ef895.firebaseapp.com",
  databaseURL: "https://faith-social-ef895-default-rtdb.firebaseio.com",
  projectId: "faith-social-ef895",
  storageBucket: "faith-social-ef895.firebasestorage.app",
  messagingSenderId: "485831767405",
  appId: "1:485831767405:web:c858ecef63de122f51d664",
  measurementId: "G-C5M1353WGT"
};


const app = initializeApp(firebaseConfig);


export const analytics = getAnalytics(app);

// Export for use in Signup/Login components
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
