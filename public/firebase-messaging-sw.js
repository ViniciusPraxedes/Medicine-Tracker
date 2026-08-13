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

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

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

