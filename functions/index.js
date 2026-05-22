// Import the onSchedule function from the scheduler package in firebase-functions/v2
const { onSchedule } = require("firebase-functions/v2/scheduler");
// Import the initializeApp function from the firebase-admin/app package
const { initializeApp } = require("firebase-admin/app");
// Import the getFirestore function from the firebase-admin/firestore package
const { getFirestore } = require("firebase-admin/firestore");
// Import the getMessaging function from the firebase-admin/messaging package
const { getMessaging } = require("firebase-admin/messaging");

// Initialize the Firebase Admin SDK application instance
initializeApp();
// Create a Firestore database client instance
const db = getFirestore();
// Create a Firebase Cloud Messaging client instance
const messaging = getMessaging();

// Define and export a scheduled function that runs every 1 minute
exports.sendMedicationReminders = onSchedule("* * * * *", async () => {
    // Get the current date and time representing the execution timestamp
    const now = new Date();
    // Begin try block to handle potential Firestore or FCM operations exceptions
    try {
        // Query the users collection to retrieve all user documents
        const usersSnapshot = await db.collection("users").get();
        // Check if there are no users in the database snapshot
        if (usersSnapshot.empty) {
            // Stop executing the function since there are no users
            return;
            // End of empty check conditional
        }
        // Create an array to store all promise operations for parallel execution
        const tasks = [];
        // Iterate through each user document in the snapshot
        usersSnapshot.forEach((userDoc) => {
            // Retrieve the data payload of the user document
            const userData = userDoc.data();
            // Check if the user document does not contain an FCM registration token
            if (!userData.fcmToken) {
                // Skip this user and continue to the next one
                return;
                // End of token check conditional
            }
            // Add a task promise for processing this user to our tasks array
            tasks.push((async () => {
                // Retrieve the timezone string from the user data or default to UTC
                const timezone = userData.timezone || "UTC";
                // Get the local day name abbreviation for the user
                const userDay = now.toLocaleDateString("en-US", { weekday: "short", timeZone: timezone });
                // Retrieve all medication documents for the current user
                const medsSnapshot = await db.collection("users").doc(userDoc.id).collection("medications").get();
                // Check if the user has no medications registered
                if (medsSnapshot.empty) {
                    // Stop processing this user
                    return;
                    // End of medications check conditional
                }
                // Iterate through each medication document
                medsSnapshot.forEach((medDoc) => {
                    // Extract the medication properties
                    const med = medDoc.data();
                    // Check if reminders are enabled for this medication (defaulting to true)
                    if (med.remindersEnabled !== false) {
                        // Check if schedule is defined and contains days and times arrays
                        if (med.schedule && Array.isArray(med.schedule.days) && Array.isArray(med.schedule.times)) {
                            // Check if the medication is scheduled for the user's current day
                            if (med.schedule.days.includes(userDay)) {
                                // Find if any scheduled time matches the reminder interval
                                const dueTime = med.schedule.times.find((timeStr) => {
                                    // Split the time string into hour and minute integers
                                    const [hour, minute] = timeStr.split(":").map(Number);
                                    // Get the current time string in the user's local timezone
                                    const localTimeStr = now.toLocaleTimeString("en-US", { hour12: false, timeZone: timezone });
                                    // Split local time string to parse hours and minutes
                                    const [currHour, currMinute] = localTimeStr.split(":").map(Number);
                                    // Calculate total minutes from midnight for the scheduled time
                                    const schedMin = hour * 60 + minute;
                                    // Calculate total minutes from midnight for current local time
                                    const currMin = currHour * 60 + currMinute;
                                    // Calculate difference in minutes between current time and scheduled time
                                    const diff = currMin - schedMin;
                                    // Check if scheduled time is due within the 1 minute window
                                    return diff >= 0 && diff < 1;
                                    // End of find check
                                });
                                // If a due time has been found, send a push notification
                                if (dueTime) {
                                    // Construct the FCM message payload
                                    const message = {
                                        // Target registration token of the user's device
                                        token: userData.fcmToken,
                                        // Specify notification content details
                                        notification: {
                                            // Title of the push notification alert
                                            title: "Medicine Tracker"
                                            // End of notification details object
                                        }
                                        // End of message object structure
                                    };
                                    // Send the FCM notification and catch failures
                                    messaging.send(message)
                                        // Log successful message sends
                                        .then((response) => console.log("Sent notification:", response))
                                        // Log failed message sends
                                        .catch((err) => console.error("Error sending notification:", err));
                                    // End of dueTime check conditional
                                }
                                // End of day schedule match check
                            }
                            // End of schedule validation check
                        }
                        // End of remindersEnabled check conditional
                    }
                    // End of medications loop
                });
                // End of user processing async function
            })());
            // End of user docs loop
        });
        // Wait for all user reminder tasks to finish processing
        await Promise.all(tasks);
        // Catch any errors that occur during the batch execution process
    } catch (err) {
        // Output database query or processing error to the function logs
        console.error("Error processing reminders:", err);
        // End of try-catch block
    }
    // End of scheduled cloud function definition
});
