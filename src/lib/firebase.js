import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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

export const messaging = getMessaging(app);
const VAPID_KEY = "BOy7n9TIdKYhbJe6Qwe7_D1U7nQ5UKpbi0xcNHQXsJNiCPa0ra3QuUvEKOc7Icp13iuvwDurEokQo2AxCCsI_04";

export const requestNotificationPermission = async (userId) => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (token) {
                const userRef = doc(db, 'users', userId);
                await setDoc(userRef, { fcmToken: token }, { merge: true });
                console.log("FCM Token saved successfully.");
                return token;
            } else {
                console.log('No registration token available. Request permission to generate one.');
            }
        } else {
            console.log('User denied notification permissions.');
        }
    } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
    }
    return null;
};

export const listenForMessages = (callback) => {
    return onMessage(messaging, callback);
};

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
