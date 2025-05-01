// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKhxqUj1lvRdwE4f5OSBYdNPejCdZsW-c",
  authDomain: "constitucheck.firebaseapp.com",
  projectId: "constitucheck",
  storageBucket: "constitucheck.firebasestorage.app",
  messagingSenderId: "1013706895454",
  appId: "1:1013706895454:web:20eb2f071a7fc6903c44cf",
  measurementId: "G-6YLQ2GG6SH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);