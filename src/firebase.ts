// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCuoS5XiuLNKz5JDrUOq9IwscBglhYq7_w",
  authDomain: "myfirstproject-ccf8a.firebaseapp.com",
  projectId: "myfirstproject-ccf8a",
  storageBucket: "myfirstproject-ccf8a.firebasestorage.app",
  messagingSenderId: "78512504927",
  appId: "1:78512504927:web:5e57f1150c06e246f09bea",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
