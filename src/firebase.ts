// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

//Correct Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuoS5XiuLNKz5JDrUOq9IwscBglhYq7_w",
  authDomain: "myfirstproject-ccf8a.firebaseapp.com",
  projectId: "myfirstproject-ccf8a",
  storageBucket: "myfirstproject-ccf8a.appspot.com", // ✅ fixed domain
  messagingSenderId: "78512504927",
  appId: "1:78512504927:web:5e57f1150c06e246f09bea",
  measurementId: "G-MHLC0YSSSB", // optional, but fine to keep
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore reference
export const db = getFirestore(app);
