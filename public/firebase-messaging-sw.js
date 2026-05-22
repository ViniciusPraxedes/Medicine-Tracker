// Declare global variables for the service worker context
/* global importScripts, firebase */
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyC5vqcG7-KT4X9f80F9hnVnQtA3PPpdzcw",
    authDomain: "gen-lang-client-0191688350.firebaseapp.com",
    projectId: "gen-lang-client-0191688350",
    storageBucket: "gen-lang-client-0191688350.firebasestorage.app",
    messagingSenderId: "782298438626",
    appId: "1:782298438626:web:9989f27af6cfb3598cf7bb",
    measurementId: "G-NQF4STJ0JY"
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

