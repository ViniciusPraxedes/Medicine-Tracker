import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
// Import Firestore database client, document reference, mutation, and arrayUnion helpers
import { getFirestore, doc, setDoc, arrayUnion } from "firebase/firestore";
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

// Initialize the primary Firebase application instance
const app = initializeApp(firebaseConfig);
// Initialize and export the Firebase authentication module
export const auth = getAuth(app);
// Initialize and export the Cloud Firestore database client
export const db = getFirestore(app);
// Initialize and export Google Auth provider instance
export const googleProvider = new GoogleAuthProvider();

// Safely initialize the Firebase Cloud Messaging client if supported in current environment
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;
// Retrieve the VAPID key dynamically from environment variables
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Export asynchronous function to request notification permission and store token
export const requestNotificationPermission = async (userId) => {
    // Start block to request permission and retrieve FCM token with timezone info
    try {
        // Verify browser Notification API availability
        if (typeof window === 'undefined' || !('Notification' in window)) {
            // Log that notifications are not supported in this environment
            console.log("Notifications are not supported in this environment.");
            // Return null when notifications cannot be supported
            return null;
        // Close unsupported environment check
        }
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
            // Declare variable to hold active service worker registration
            let registration = null;
            // Check if service workers are supported in navigator
            if ('serviceWorker' in navigator) {
                // Construct dynamic query search parameters from runtime configuration
                const swParams = new URLSearchParams({
                    // Provide dynamic API key parameter
                    apiKey: firebaseConfig.apiKey || "",
                    // Provide dynamic auth domain parameter
                    authDomain: firebaseConfig.authDomain || "",
                    // Provide dynamic project ID parameter
                    projectId: firebaseConfig.projectId || "",
                    // Provide dynamic storage bucket parameter
                    storageBucket: firebaseConfig.storageBucket || "",
                    // Provide dynamic messaging sender ID parameter
                    messagingSenderId: firebaseConfig.messagingSenderId || "",
                    // Provide dynamic application ID parameter
                    appId: firebaseConfig.appId || "",
                    // Provide dynamic measurement ID parameter
                    measurementId: firebaseConfig.measurementId || ""
                // Serialize parameters to query string
                }).toString();
                // Register service worker with dynamic configuration query parameters
                registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${swParams}`);
                // Await service worker readiness state
                await navigator.serviceWorker.ready;
            // Close serviceWorker support check
            }
            // Construct token retrieval options object
            const tokenOptions = {
                // Pass active service worker registration if available
                ...(registration ? { serviceWorkerRegistration: registration } : {}),
                // Pass dynamic VAPID public key if present
                ...(VAPID_KEY ? { vapidKey: VAPID_KEY } : {})
            // Close token retrieval options object
            };
            // Retrieve the FCM registration token for messaging instance and options
            const token = await getToken(messaging, tokenOptions);
            // Check if a registration token was successfully retrieved
            if (token) {
                // Get the user's current local timezone name string
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                // Create a reference to the specific user's Firestore document
                const userRef = doc(db, 'users', userId);
                // Save the retrieved FCM token, tokens array, and timezone string in the user document
                await setDoc(userRef, { fcmToken: token, fcmTokens: arrayUnion(token), timezone: timezone }, { merge: true });
                // Log the successful execution to the developers browser console
                console.log("FCM Token saved successfully.");
                // Return the token to the calling function
                return token;
            // Execute fallback code if token retrieval was unsuccessful
            } else {
                // Log message indicating token generation was unsuccessful
                console.log('No registration token available. Request permission to generate one.');
            // Close token existence check conditional
            }
        // Execute fallback block if user denied notification permission
        } else {
            // Log that notification permissions were denied by user
            console.log('User denied notification permissions.');
        // Close permission granted check conditional
        }
    // Catch errors during notification permission request or token retrieval
    } catch (error) {
        // Output token retrieval error to browser console
        console.error('An error occurred while retrieving token. ', error);
    // Close try-catch block
    }
    // Return null fallback when token could not be obtained
    return null;
// Close requestNotificationPermission function definition
};

// Export helper to listen for foreground push messages
export const listenForMessages = (callback) => {
    // Check if messaging client is initialized before subscribing
    if (!messaging) return () => {};
    // Subscribe to incoming foreground messages and return unsubscribe callback
    return onMessage(messaging, callback);
// Close listenForMessages function definition
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
