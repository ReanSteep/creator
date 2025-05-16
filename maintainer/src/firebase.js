// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDsMjGeRrNOw-DiCllaX9MydOSnUsa80I8",
  authDomain: "love-cf107.firebaseapp.com",
  projectId: "love-cf107",
  storageBucket: "love-cf107.firebasestorage.app",
  messagingSenderId: "852796790586",
  appId: "1:852796790586:web:fec1ee8f00d47ccd6d6203",
  measurementId: "G-Y251BRBRJB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);