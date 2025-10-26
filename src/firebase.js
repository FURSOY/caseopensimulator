import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Eklendi

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRdTKyqJynXb7ivxk2cIeSREZtNb69ZKw",
  authDomain: "dersodev-8bfb2.firebaseapp.com",
  projectId: "dersodev-8bfb2",
  storageBucket: "dersodev-8bfb2.firebasestorage.app", // .appspot.com ile bitmeli
  messagingSenderId: "466480055609",
  appId: "1:466480055609:web:60492b0214deee35fc54e8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // Eklendi
