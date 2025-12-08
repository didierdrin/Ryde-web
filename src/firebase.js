// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAupSYiRp59zscKFA7ir8v7Curq1Fi6lF4",
    authDomain: "ryde-rw.firebaseapp.com",
    projectId: "ryde-rw",
    storageBucket: "ryde-rw.firebasestorage.app",
    messagingSenderId: "773511856450",
    appId: "1:773511856450:web:f6dfa5ff878853deb648db",
    measurementId: "G-2M10SLQP2K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
