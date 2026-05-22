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
    // Start block to request permission and retrieve FCM token with timezone info
    try {
        // Request the user's permission to display browser push notifications
        const permission = await Notification.requestPermission();
        // Check if the user has granted permission for notifications
        if (permission === 'granted') {
            // Check if the user ID indicates a mock/guest user session
            if (userId && userId.startsWith('mock')) {
                // Generate a mock FCM registration token string for local testing
                const mockToken = "mock-fcm-token-" + userId;
                // Retrieve user's current timezone string identifier
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                // Store the mock token locally in the browser's localStorage
                localStorage.setItem('mock_fcm_token', mockToken);
                // Store the mock timezone info locally in the browser's localStorage
                localStorage.setItem('mock_timezone', timezone);
                // Log the successful mock token generation event to the console
                console.log("Mock FCM Token saved locally.");
                // Return the simulated mock token to the caller
                return mockToken;
            // Close conditional block for mock user handling
            }
            // Retrieve the FCM registration token for the messaging instance and VAPID key
            const token = await getToken(messaging, { vapidKey: VAPID_KEY });
            // Check if a registration token was successfully retrieved
            if (token) {
                // Get the user's current local timezone name string
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                // Create a reference to the specific user's Firestore document
                const userRef = doc(db, 'users', userId);
                // Save the retrieved FCM token and timezone string in the user document
                await setDoc(userRef, { fcmToken: token, timezone: timezone }, { merge: true });
                // Log the successful execution to the developers browser console
                console.log("FCM Token saved successfully.");
                // Return the token to the calling function
                return token;
            // Execute fallback code if token retrieval was unsuccessful
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
