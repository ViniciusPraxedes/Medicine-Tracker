import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Declare the Firebase configuration object using dynamic environment parameters
const firebaseConfig = {
    // Retrieve the Firebase API Key dynamically from environment variables
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    // Retrieve the Firebase Auth Domain dynamically from environment variables
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    // Retrieve the Firebase Project ID dynamically from environment variables
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    // Retrieve the Firebase Storage Bucket dynamically from environment variables
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    // Retrieve the Firebase Messaging Sender ID dynamically from environment variables
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    // Retrieve the Firebase App ID dynamically from environment variables
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    // Retrieve the Firebase Measurement ID dynamically from environment variables
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
// Close the Firebase configuration object declaration
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const messaging = getMessaging(app);
// Retrieve the VAPID key dynamically from environment variables
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

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
