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
                // Calculate timestamp for 24 hours ago as ISO string
                const yesterdayIso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
                // Query logs subcollection for entries created in the last 24 hours
                const logsSnapshot = await db.collection("users").doc(userDoc.id).collection("logs").where("timestamp", ">=", yesterdayIso).get();
                // Helper to format date string safely matching timezone
                let dateStr = "";
                // Begin block to format date safely
                try {
                    // Create date formatter with user timezone
                    const formatter = new Intl.DateTimeFormat("en-US", {
                        // Request four digit year format
                        year: "numeric",
                        // Request two digit month format
                        month: "2-digit",
                        // Request two digit day format
                        day: "2-digit",
                        // Pass active user timezone parameter
                        timeZone: timezone
                    // End of Intl.DateTimeFormat configuration object
                    });
                    // Format current date to parts
                    const parts = formatter.formatToParts(now);
                    // Find year component
                    const yearPart = parts.find(p => p.type === 'year').value;
                    // Find month component
                    const monthPart = parts.find(p => p.type === 'month').value;
                    // Find day component
                    const dayPart = parts.find(p => p.type === 'day').value;
                    // Merge parts to YYYY-MM-DD format
                    dateStr = `${yearPart}-${monthPart}-${dayPart}`;
                // Catch any date formatting errors
                } catch (err) {
                    // Fall back to UTC ISO date string if timezone formatting fails
                    dateStr = now.toISOString().split('T')[0];
                // End of date formatting try catch block
                }
                // Initialize list to hold today's taken medication logs
                const takenLogs = [];
                // Check if any logs were retrieved for the user
                if (!logsSnapshot.empty) {
                    // Loop through each log document in the snapshot
                    logsSnapshot.forEach((logDoc) => {
                        // Extract log document data payload
                        const logData = logDoc.data();
                        // Verify if log matches taken action and matches user local date
                        if (logData.action === "take" && logData.timestamp && logData.timestamp.startsWith(dateStr)) {
                            // Add log record including document identifier to our list
                            takenLogs.push({ id: logDoc.id, ...logData });
                        // End of log match condition check
                        }
                    // End of logs snapshots loop iteration
                    });
                // End of logs snapshot empty check conditional
                }
                // Initialize list to compile all scheduled doses for today
                const doses = [];
                // Iterate through each medication document in the snapshot
                medsSnapshot.forEach((medDoc) => {
                    // Extract medication document data payload
                    const med = medDoc.data();
                    // Check if reminders are enabled for this medication (defaulting to true)
                    if (med.remindersEnabled !== false) {
                        // Validate schedule layout configuration presence
                        if (med.schedule && Array.isArray(med.schedule.days) && Array.isArray(med.schedule.times)) {
                            // Check if medication is scheduled for current day abbreviation
                            if (med.schedule.days.includes(userDay)) {
                                // Loop through all scheduled time strings
                                med.schedule.times.forEach((timeStr) => {
                                    // Append dose detail payload containing medication and time
                                    doses.push({
                                        // Store medication identifier
                                        medicationId: medDoc.id,
                                        // Store medication name
                                        medicationName: med.name,
                                        // Store custom snooze interval in minutes or default to 10
                                        snoozeInterval: med.snoozeInterval !== undefined ? Number(med.snoozeInterval) : 10,
                                        // Store scheduled time string
                                        time: timeStr,
                                        // Initialize taken flag to false
                                        taken: false
                                    // End of dose object structure
                                    });
                                // End of scheduled times loop iteration
                                });
                            // End of schedule day match check
                            }
                        // End of schedule layout check
                        }
                    // End of remindersEnabled check conditional
                    }
                // End of medication documents loop iteration
                });
                // Sort list of doses chronologically by scheduled time
                doses.sort((a, b) => a.time.localeCompare(b.time));
                // Create a set tracking matched log identifiers
                const processedLogs = new Set();
                // Iterate through each scheduled dose
                doses.forEach((dose) => {
                    // Find first unused matching taken log for the same medication
                    const matchingLog = takenLogs.find((l) => l.medicationId === dose.medicationId && !processedLogs.has(l.id));
                    // Check if a matching log was found
                    if (matchingLog) {
                        // Mark scheduled dose as taken
                        dose.taken = true;
                        // Record log identifier as processed/matched
                        processedLogs.add(matchingLog.id);
                    // End of matching log check conditional
                    }
                // End of doses loop iteration
                });
                // Get the current local time string in 24-hour format
                const localTimeStr = now.toLocaleTimeString("en-US", { hour12: false, timeZone: timezone });
                // Parse current local hour and minute integer numbers
                const [currHour, currMinute] = localTimeStr.split(":").map(Number);
                // Compute total minutes from midnight for current local time
                const currMin = currHour * 60 + currMinute;
                // Iterate through all scheduled doses to identify due reminders
                doses.forEach((dose) => {
                    // Check if the scheduled dose has not been marked as taken
                    if (!dose.taken) {
                        // Parse scheduled hour and minute integer values
                        const [schedHour, schedMinute] = dose.time.split(":").map(Number);
                        // Compute total minutes from midnight for the scheduled time
                        const schedMin = schedHour * 60 + schedMinute;
                        // Compute elapsed difference in minutes since scheduled time
                        const diff = currMin - schedMin;
                        // Check if the current time is due or overdue
                        if (diff >= 0) {
                            // Initialize reminder notification trigger flag
                            let shouldNotify = false;
                            // Check if current minute matches exact scheduled time
                            if (diff === 0) {
                                // Trigger initial notification
                                shouldNotify = true;
                            // Check if overdue minutes match snooze interval and are within limit
                            } else if (dose.snoozeInterval > 0 && diff <= 60 && diff % dose.snoozeInterval === 0) {
                                // Trigger snooze notification
                                shouldNotify = true;
                            // End of trigger conditions check
                            }
                            // Check if the notification should be triggered
                            if (shouldNotify) {
                                // Determine if this is a snooze notification or first alert
                                const isSnooze = diff > 0;
                                // Build push notification FCM message structure
                                const message = {
                                    // Device registration token reference
                                    token: userData.fcmToken,
                                    // Define notification alert content properties
                                    notification: {
                                        // Set header alert title based on snooze status
                                        title: isSnooze ? `Snooze: ${dose.medicationName}` : `Reminder: ${dose.medicationName}`,
                                        // Set detail alert body message with instructions
                                        body: isSnooze
                                            ? `You missed your scheduled dose of ${dose.medicationName} (${dose.time}). Please take it and mark it as taken.`
                                            : `It is time to take your ${dose.medicationName} (${dose.time}).`
                                    // End of notification content details
                                    }
                                // End of message object structure
                                };
                                // Send FCM push notification payload to user device
                                messaging.send(message)
                                    // Log successful FCM message delivery response
                                    .then((response) => console.log("Sent notification successfully:", response))
                                    // Output FCM delivery failure reason to server logs
                                    .catch((err) => console.error("Error sending push notification:", err));
                            // End of shouldNotify check conditional
                            }
                        // End of diff >= 0 check conditional
                        }
                    // End of dose.taken check conditional
                    }
                // End of doses iteration loop
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
