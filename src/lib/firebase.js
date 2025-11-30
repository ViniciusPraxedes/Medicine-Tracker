import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC5vqcG7-KT4X9f80F9hnVnQtA3PPpdzcw",
    authDomain: "gen-lang-client-0191688350.firebaseapp.com",
    projectId: "gen-lang-client-0191688350",
    storageBucket: "gen-lang-client-0191688350.firebasestorage.app",
    messagingSenderId: "782298438626",
    appId: "1:782298438626:web:9989f27af6cfb3598cf7bb",
    measurementId: "G-NQF4STJ0JY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error("Error signing in with Google", error);
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
    }
};
