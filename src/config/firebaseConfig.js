// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDR7Lw0eAsaoWCaaKCjaa2_ZduGjL3qgCY",
  authDomain: "test-67dbe.firebaseapp.com",
  projectId: "test-67dbe",
  storageBucket: "test-67dbe.firebasestorage.app",
  messagingSenderId: "575651746488",
  appId: "1:575651746488:web:bfcb112b31327f73f4da4d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app);
export const db=getFirestore(app);