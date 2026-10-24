// Declare global variables for the service worker context
/* global importScripts, firebase */
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

// Parse URL query parameters from the service worker location scope
const params = new URLSearchParams(self.location.search);
// Declare the dynamic Firebase configuration object from URL search parameters
const firebaseConfig = {
    // Extract the Firebase API Key parameter dynamically
    apiKey: params.get("apiKey"),
    // Extract the Firebase Auth Domain parameter dynamically
    authDomain: params.get("authDomain"),
    // Extract the Firebase Project ID parameter dynamically
    projectId: params.get("projectId"),
    // Extract the Firebase Storage Bucket parameter dynamically
    storageBucket: params.get("storageBucket"),
    // Extract the Firebase Messaging Sender ID parameter dynamically
    messagingSenderId: params.get("messagingSenderId"),
    // Extract the Firebase App ID parameter dynamically
    appId: params.get("appId"),
    // Extract the Firebase Measurement ID parameter dynamically
    measurementId: params.get("measurementId")
// End of dynamic Firebase configuration declaration
};

// Check if the required API key and project ID parameters are present in search parameters
if (params.get("apiKey") && params.get("projectId")) {
    // Initialize the Firebase application instance with dynamic parameters
    firebase.initializeApp(firebaseConfig);
    // Initialize the Firebase Cloud Messaging client
    const messaging = firebase.messaging();
    // Register the background message handler callback
    messaging.onBackgroundMessage((payload) => {
        // Check if message payload already contains notification object handled by FCM SDK
        if (payload && payload.notification) {
            // Skip manual display to prevent duplicate notification
            return;
        // End payload notification check conditional
        }
        // Extract notification title from payload data with fallback text
        const notificationTitle = payload?.data?.title || "Medication Reminder";
        // Define notification presentation options
        const notificationOptions = {
            // Set notification body text from data payload with fallback text
            body: payload?.data?.body || "You have a scheduled medication reminder.",
            // Set notification display icon
            icon: "/favicon.png",
            // Set notification badge icon
            badge: "/favicon.png",
            // Attach payload data object
            data: payload?.data || {}
        // Close notification presentation options
        };
        // Show system notification using the service worker registration
        return self.registration.showNotification(notificationTitle, notificationOptions);
    // Close onBackgroundMessage handler
    });
// Close parameter presence check conditional
}

// Add an event listener for notification click actions
self.addEventListener("notificationclick", (event) => {
    // Close the clicked system notification
    event.notification.close();
    // Keep service worker active until window focus or navigation completes
    event.waitUntil(
        // Search through all existing client windows
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            // Iterate over all discovered open window clients
            for (let i = 0; i < clientList.length; i++) {
                // Reference the current client entry
                const client = clientList[i];
                // Check if client URL exists and focus method is available
                if (client.url && "focus" in client) {
                    // Focus the existing open application window
                    return client.focus();
                // Close client check conditional
                }
            // Close client iteration loop
            }
            // Verify if openWindow API is available on clients
            if (self.clients.openWindow) {
                // Open the application root in a new window
                return self.clients.openWindow("/");
            // Close openWindow availability check
            }
        // Close client list resolution handler
        })
    // Close waitUntil handler call
    );
// Close notificationclick event listener
});

// Add an event listener for the install phase of the service worker
self.addEventListener("install", () => {
    // Force the waiting service worker to become the active service worker immediately
    self.skipWaiting();
// End of install event listener
});

// Add an event listener for the activate phase of the service worker
self.addEventListener("activate", (event) => {
    // Claim control of all open clients immediately upon activation
    event.waitUntil(self.clients.claim());
// End of activate event listener
});

