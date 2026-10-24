// Disable react-refresh component export check for context files
/* eslint-disable react-refresh/only-export-components */
// Import React, createContext, useState, useEffect, and useContext hooks
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db, signInWithGoogle, logout } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
// Import Firestore collection query utilities, snapshot listeners, and database mutation helpers
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, increment } from 'firebase/firestore';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Initial State (Local)
    // Initial State (Local)
    // Initial State (Empty)
    const [medications, setMedications] = useState([]);
    const [logs, setLogs] = useState([]);

    // Auth Listener
    useEffect(() => {
        // Check if the current location hostname matches local server paths
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        // Check if local dev or start mode should bypass real Firebase authentication
        if (isLocal) {
            // Retrieve any persisted guest/mock user session from local storage
            const savedMockUser = localStorage.getItem('mock_user');
            // Check if a saved mock user session string exists
            if (savedMockUser) {
                // Defer updating user state to avoid synchronous effect warnings
                setTimeout(() => {
                    // Parse the saved guest details and set the user state
                    setUser(JSON.parse(savedMockUser));
                // End of timeout deferred block for user session restoration
                }, 0);
            // End of saved mock user check conditional
            }
            // Defer setting loading to false to avoid synchronous effect warnings
            setTimeout(() => {
                // Set loading state to false since login detection is resolved
                setLoading(false);
            // End of timeout deferred block for loading state
            }, 0);
            // Return a dummy no-op unsubscribe callback function
            return () => {};
        // End of local bypass check block
        }
        // Subscribe to real Firebase authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            // Update the user session state with current authenticated user
            setUser(currentUser);
            // Check if the user is authenticated in the system
            if (!currentUser) {
                // Clear the local medications state list
                setMedications([]);
                // Clear the local logs state list
                setLogs([]);
            // End of conditional block check
            }
            // Set authentication checking state to complete
            setLoading(false);
        // End of authentication callback handler
        });
        // Return unsubscribe function to clean up auth listener
        return () => unsubscribe();
    }, []);

    // Firestore Sync with local storage fallback for development mock user mode
    useEffect(() => {
        // If there is no authenticated user, stop execution of the effect
        if (!user) return;
        // Check if the current user is a local development mock user
        if (user.isMock) {
            // Retrieve mock medications from local storage if they exist
            const savedMeds = localStorage.getItem('mock_medications');
            // Initialize parsed medications helper variable
            let parsedMeds = null;
            // Begin block to catch JSON parsing exceptions of local storage data
            try {
                // Parse medications from local storage if savedMeds exists
                parsedMeds = savedMeds ? JSON.parse(savedMeds) : null;
            // Catch parsing errors safely
            } catch (err) {
                // Set parsed medications to null on parse failure
                parsedMeds = null;
            // End of parse try block
            }
            // Check if saved medications exist in local storage and contain elements
            if (parsedMeds && parsedMeds.length > 0) {
                // Defer updating medications state to avoid synchronous effect warnings
                setTimeout(() => {
                    // Update the medications state with parsed data
                    setMedications(parsedMeds);
                // End of timeout deferred block for medications state
                }, 0);
            // Executed if no mock medications are saved in local storage
            } else {
                // Create a list of mock medications to seed the local test database
                const mockMedsSeed = [
                    // Start of first medication object
                    {
                        // Unique identifier for the mock medication
                        id: 'mock-med-1',
                        // Medication name
                        name: 'Ibuprofen',
                        // Dosage instructions
                        dosage: '400mg',
                        // Pack size count
                        totalPills: 30,
                        // Current pill count
                        currentPills: 25,
                        // Food relation selection
                        relationToFood: 'with_food',
                        // Notification toggle setting enabled by default
                        remindersEnabled: true,
                        // Intakes schedule representation
                        schedule: {
                            // Array of scheduled times
                            times: ['08:00', '20:00'],
                            // Array of scheduled days of the week
                            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                        // End of schedule structure
                        }
                    // End of first medication object
                    },
                    // Start of second medication object
                    {
                        // Unique identifier for the second mock medication
                        id: 'mock-med-2',
                        // Medication name
                        name: 'Vitamin D3',
                        // Dosage instructions
                        dosage: '2000 IU',
                        // Pack size count
                        totalPills: 60,
                        // Current pill count
                        currentPills: 55,
                        // Food relation selection
                        relationToFood: 'with_food',
                        // Notification toggle setting enabled by default
                        remindersEnabled: true,
                        // Intakes schedule representation
                        schedule: {
                            // Array of scheduled times
                            times: ['09:00'],
                            // Array of scheduled days of the week
                            days: ['Mon', 'Wed', 'Fri']
                        // End of schedule structure
                        }
                    // End of second medication object
                    },
                    // Start of third medication object
                    {
                        // Unique identifier for the third mock medication
                        id: 'mock-med-3',
                        // Medication name
                        name: 'Amoxicillin',
                        // Dosage instructions
                        dosage: '500mg',
                        // Pack size count
                        totalPills: 20,
                        // Current pill count
                        currentPills: 14,
                        // Food relation selection
                        relationToFood: 'without_food',
                        // Notification toggle setting disabled by default
                        remindersEnabled: false,
                        // Intakes schedule representation
                        schedule: {
                            // Array of scheduled times
                            times: ['12:00', '18:00'],
                            // Array of scheduled days of the week
                            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                        // End of schedule structure
                        }
                    // End of third medication object
                    }
                // End of medications seed array
                ];
                // Defer updating medications state to avoid synchronous effect warnings
                setTimeout(() => {
                    // Seed the local state medications list
                    setMedications(mockMedsSeed);
                // End of timeout deferred block for medications state
                }, 0);
            // End of savedMeds check conditional block
            }
            // Retrieve mock logs from local storage if they exist
            const savedLogs = localStorage.getItem('mock_logs');
            // Initialize parsed logs helper variable
            let parsedLogs = null;
            // Begin block to catch JSON parsing exceptions of logs data
            try {
                // Parse logs from local storage if savedLogs exists
                parsedLogs = savedLogs ? JSON.parse(savedLogs) : null;
            // Catch parsing errors safely
            } catch (err) {
                // Set parsed logs to null on parse failure
                parsedLogs = null;
            // End of parse try block
            }
            // Check if saved logs exist in local storage and contain elements
            if (parsedLogs && parsedLogs.length > 0) {
                // Defer updating logs state to avoid synchronous effect warnings
                setTimeout(() => {
                    // Update the logs state with parsed data
                    setLogs(parsedLogs);
                // End of timeout deferred block for logs state
                }, 0);
            // Executed if no mock logs are saved in local storage
            } else {
                // Get current date representation
                const todayVal = new Date();
                // Create log timestamp for today at 08:00
                const todayAM = new Date(todayVal.getFullYear(), todayVal.getMonth(), todayVal.getDate(), 8, 0, 0).toISOString();
                // Create log timestamp for yesterday at 08:00
                const yesterdayAM = new Date(todayVal.getFullYear(), todayVal.getMonth(), todayVal.getDate() - 1, 8, 0, 0).toISOString();
                // Create log timestamp for yesterday at 20:00
                const yesterdayPM = new Date(todayVal.getFullYear(), todayVal.getMonth(), todayVal.getDate() - 1, 20, 0, 0).toISOString();
                // Create log timestamp for two days ago at 08:00
                const twoDaysAgoAM = new Date(todayVal.getFullYear(), todayVal.getMonth(), todayVal.getDate() - 2, 8, 0, 0).toISOString();
                // Create log timestamp for two days ago at 20:00
                const twoDaysAgoPM = new Date(todayVal.getFullYear(), todayVal.getMonth(), todayVal.getDate() - 2, 20, 0, 0).toISOString();
                // Define the array of mock logs to seed the local test database
                const mockLogsSeed = [
                    // Start of first log object
                    {
                        // Unique identifier for the first log
                        id: 'mock-log-1',
                        // Medication identifier link
                        medicationId: 'mock-med-1',
                        // Medication name
                        medicationName: 'Ibuprofen',
                        // Taken action type
                        action: 'take',
                        // Timestamp of intake
                        timestamp: twoDaysAgoAM
                    // End of first log object
                    },
                    // Start of second log object
                    {
                        // Unique identifier for the second log
                        id: 'mock-log-2',
                        // Medication identifier link
                        medicationId: 'mock-med-1',
                        // Medication name
                        medicationName: 'Ibuprofen',
                        // Taken action type
                        action: 'take',
                        // Timestamp of intake
                        timestamp: twoDaysAgoPM
                    // End of second log object
                    },
                    // Start of third log object
                    {
                        // Unique identifier for the third log
                        id: 'mock-log-3',
                        // Medication identifier link
                        medicationId: 'mock-med-1',
                        // Medication name
                        medicationName: 'Ibuprofen',
                        // Taken action type
                        action: 'take',
                        // Timestamp of intake
                        timestamp: yesterdayAM
                    // End of third log object
                    },
                    // Start of fourth log object
                    {
                        // Unique identifier for the fourth log
                        id: 'mock-log-4',
                        // Medication identifier link
                        medicationId: 'mock-med-1',
                        // Medication name
                        medicationName: 'Ibuprofen',
                        // Taken action type
                        action: 'take',
                        // Timestamp of intake
                        timestamp: yesterdayPM
                    // End of fourth log object
                    },
                    // Start of fifth log object
                    {
                        // Unique identifier for the fifth log
                        id: 'mock-log-5',
                        // Medication identifier link
                        medicationId: 'mock-med-1',
                        // Medication name
                        medicationName: 'Ibuprofen',
                        // Taken action type
                        action: 'take',
                        // Timestamp of intake
                        timestamp: todayAM
                    // End of fifth log object
                    },
                    // Start of sixth log object
                    {
                        // Unique identifier for the sixth log
                        id: 'mock-log-6',
                        // Medication identifier link
                        medicationId: 'mock-med-2',
                        // Medication name
                        medicationName: 'Vitamin D3',
                        // Taken action type
                        action: 'take',
                        // Timestamp of intake
                        timestamp: yesterdayAM
                    // End of sixth log object
                    }
                // End of logs seed array
                ];
                // Defer updating logs state to avoid synchronous effect warnings
                setTimeout(() => {
                    // Seed the local state logs list
                    setLogs(mockLogsSeed);
                // End of timeout deferred block for logs state
                }, 0);
            // End of savedLogs check conditional block
            }
            // Exit early to prevent subscribing to Firestore listeners
            return;
        // End mock check block
        }
        // Subscribe to Medications
        const medUnsub = onSnapshot(collection(db, 'users', user.uid, 'medications'), (snapshot) => {
            const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMedications(meds);
        });

        // Subscribe to Logs
        const logsQuery = query(collection(db, 'users', user.uid, 'logs'), orderBy('timestamp', 'asc'));
        const logUnsub = onSnapshot(logsQuery, (snapshot) => {
            const lgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLogs(lgs);
        });

        return () => {
            medUnsub();
            logUnsub();
        };
    }, [user]);

    // Local Storage synchronization for mock medications list
    useEffect(() => {
        // Check if the current user exists and is a local mock user
        if (user && user.isMock) {
            // Write medications array to local storage as JSON string
            localStorage.setItem('mock_medications', JSON.stringify(medications));
        // End user mock check
        }
    // Dependency array triggers writing when medications state or user session changes
    }, [medications, user]);

    // Local Storage synchronization for mock logs list
    useEffect(() => {
        // Check if the current user exists and is a local mock user
        if (user && user.isMock) {
            // Write logs array to local storage as JSON string
            localStorage.setItem('mock_logs', JSON.stringify(logs));
        // End user mock check
        }
    // Dependency array triggers writing when logs state or user session changes
    }, [logs, user]);



    // Actions
    const addMedication = async (med) => {
        // Build new medication object while preserving specified remaining pills or defaulting to total pills
        const newMed = { ...med, id: crypto.randomUUID(), currentPills: med.currentPills !== undefined ? parseInt(med.currentPills) : parseInt(med.totalPills) };

        // Check if the user is signed in and is not a local mock user
        if (user && !user.isMock) {
            try {
                await setDoc(doc(db, 'users', user.uid, 'medications', newMed.id), newMed);
                await logAction(newMed.id, 'add', newMed.name);
            } catch (error) {
                console.error("Error adding medication:", error);
                alert("Failed to save medication. Please check your connection or permissions.");
            }
        } else {
            setMedications(prev => [...prev, newMed]);
            logAction(newMed.id, 'add', newMed.name);
        }
    };

    const updateMedication = async (id, updates) => {
        // Check if the user is signed in and is not a local mock user
        if (user && !user.isMock) {
            try {
                await setDoc(doc(db, 'users', user.uid, 'medications', id), updates, { merge: true });
            } catch (error) {
                console.error("Error updating medication:", error);
                alert("Failed to update medication.");
            }
        } else {
            setMedications(prev => prev.map(med => med.id === id ? { ...med, ...updates } : med));
        }
    };

    const deleteMedication = async (id) => {
        // Check if the user is signed in and is not a local mock user
        if (user && !user.isMock) {
            try {
                await deleteDoc(doc(db, 'users', user.uid, 'medications', id));
            } catch (error) {
                console.error("Error deleting medication:", error);
                alert("Failed to delete medication.");
            }
        } else {
            setMedications(prev => prev.filter(med => med.id !== id));
        }
    };

    const refillMedication = async (id) => {
        const med = medications.find(m => m.id === id);
        if (!med) return;

        // Check if the user is signed in and is not a local mock user
        if (user && !user.isMock) {
            try {
                await setDoc(doc(db, 'users', user.uid, 'medications', id), { currentPills: parseInt(med.totalPills) }, { merge: true });
                await logAction(id, 'refill');
            } catch (error) {
                console.error("Error refilling medication:", error);
                alert("Failed to refill medication.");
            }
        } else {
            setMedications(prev => prev.map(m => {
                if (m.id === id) {
                    return { ...m, currentPills: parseInt(m.totalPills) };
                }
                return m;
            }));
            logAction(id, 'refill');
        }
    };

    // Define the async function to handle taking a dose of medicine
    const takeDose = async (medId) => {
        // Search the medications list to find the medication with the given ID
        const med = medications.find(m => m.id === medId);
        // If the medication does not exist, return and exit early
        if (!med) return;
        // Check if a user is currently logged into the app and is not a mock user
        if (user && !user.isMock) {
            // Begin block to catch any Firestore database operation errors
            try {
                // Only decrement the pill count if there is at least one pill left
                if (med.currentPills > 0) {
                    // Update medication document in Firebase Firestore database
                    await setDoc(doc(db, 'users', user.uid, 'medications', medId), { 
                        // Use Firestore increment operator to subtract one from current pills
                        currentPills: increment(-1) 
                    // End of object update and setDoc arguments list
                    }, { merge: true });
                // Close currentPills check conditional statement
                }
                // Record this taken dose in the activity logs
                await logAction(medId, 'take');
            // Close try block and catch database update errors
            } catch (error) {
                // Log the exception message to the console for debugging
                console.error("Error taking dose:", error);
                // Display error message to the user via alert dialog
                alert("Failed to record dose.");
            // Close catch block
            }
        // Close user block and run else if user is not logged in
        } else {
            // Update local state by mapping over the medications array
            setMedications(prev => prev.map(m => {
                // Check if the current medication item matches the targeted ID
                if (m.id === medId) {
                    // Return updated medication item with pill count capped at minimum zero
                    return { ...m, currentPills: Math.max(0, m.currentPills - 1) };
                // Close ID match conditional statement
                }
                // Return the medication item unchanged if it does not match
                return m;
            // Close map callback block
            }));
            // Log this dose taking action in the local logs state
            logAction(medId, 'take');
        // Close else block
        }
    // Close takeDose function definition
    };

    // Define async function to record taking a dose retroactive to a date and time
    const takeDoseForDate = async (medId, dateString, scheduledTime) => {
        // Look up the medication by ID in the list of medications
        const med = medications.find(m => m.id === medId);
        // If the medication is not found, stop executing this function
        if (!med) return;
        // Build an ISO format timestamp string using date string and scheduled time
        const timestamp = `${dateString}T${scheduledTime}:00.000Z`;
        // Create a new log entry object for the retroactive dose taking action
        const newLog = {
            // Generate a unique random identifier for the log entry
            id: crypto.randomUUID(),
            // Set the reference medication identifier
            medicationId: medId,
            // Store the name of the medication at the time of taking
            medicationName: med.name,
            // Define the action type as take to represent ingestion
            action: 'take',
            // Set the retroactive timestamp for when the dose was taken
            timestamp: timestamp,
            // Flag this log entry as retroactive for record keeping
            retroactive: true 
        // End of newLog object literal definition
        };
        // Check if there is an active logged in Firebase user and is not a mock user
        if (user && !user.isMock) {
            // Start try block to handle database update exceptions
            try {
                // Only decrement the pill count if there are pills remaining
                if (med.currentPills > 0) {
                    // Save updated medication document in Firestore to subtract a pill
                    await setDoc(doc(db, 'users', user.uid, 'medications', medId), { 
                        // Decrement current pill count by one in Firestore
                        currentPills: increment(-1) 
                    // End of setDoc parameters configuration
                    }, { merge: true });
                // Close conditional check for pill count existence
                }
                // Save the retroactive dose taking log object in Firestore
                await setDoc(doc(db, 'users', user.uid, 'logs', newLog.id), newLog);
            // Close try block and catch Firestore write errors
            } catch (error) {
                // Log the retroactive taking error to the console
                console.error("Error taking retroactive dose:", error);
                // Warn user via alert dialogue about database write failure
                alert("Failed to record retroactive dose.");
            // Close catch block
            }
        // Close user block and run else if user is not signed in
        } else {
            // Update local state of medications array with new counts
            setMedications(prev => prev.map(m => {
                // Check if current medication item is the one we took
                if (m.id === medId) {
                    // Return the medication record with pill count capped at zero
                    return { ...m, currentPills: Math.max(0, m.currentPills - 1) };
                // Close ID matching conditional block
                }
                // Return unchanged medication record
                return m;
            // Close map callback execution block
            }));
            // Add the new retroactive log entry to the local logs list
            setLogs(prev => [...prev, newLog]);
        // Close else block
        }
    // Close takeDoseForDate function definition
    };

    const undoDose = async (logId) => {
        const log = logs.find(l => l.id === logId);
        if (!log) return;

        // Check if a user is logged in and is not a mock user
        if (user && !user.isMock) {
            try {
                await deleteDoc(doc(db, 'users', user.uid, 'logs', logId));

                if (log.action === 'take') {
                    const med = medications.find(m => m.id === log.medicationId);
                    if (med) {
                        await setDoc(doc(db, 'users', user.uid, 'medications', med.id), { 
                            currentPills: increment(1) 
                        }, { merge: true });
                    }
                }
            } catch (error) {
                console.error("Error undoing dose:", error);
                alert("Failed to undo dose.");
            }
        } else {
            setLogs(prev => prev.filter(l => l.id !== logId));

            if (log.action === 'take') {
                setMedications(prev => prev.map(med => {
                    if (med.id === log.medicationId) {
                        return { ...med, currentPills: med.currentPills + 1 };
                    }
                    return med;
                }));
            }
        }
    };

    const logAction = async (medicationId, action, fallbackName = null) => {
        const med = medications.find(m => m.id === medicationId);
        const newLog = {
            id: crypto.randomUUID(),
            medicationId,
            medicationName: med ? med.name : (fallbackName || 'Unknown Medication'),
            action,
            timestamp: new Date().toISOString()
        };

        // Check if the user is signed in and is not a local mock user
        if (user && !user.isMock) {
            try {
                await setDoc(doc(db, 'users', user.uid, 'logs', newLog.id), newLog);
            } catch (error) {
                console.error("Error logging action:", error);
                // No alert here to avoid spamming if multiple actions fail
            }
        } else {
            setLogs(prev => [...prev, newLog]);
        }
    };

    // Define mock user authentication sign-in helper function
    const signInMockUser = () => {
        // Construct mock user details object payload
        const mockUser = {
            // Assign a test identifier string to the mock user profile
            uid: "mock-test-user-id",
            // Define display name for guest testing sessions
            displayName: "Test User (Guest)",
            // Define email address for mock authentication environment
            email: "test-guest@example.com",
            // Set isMock attribute flag to distinguish guest mode from real Auth
            isMock: true
        // Close mockUser object literal configuration definition
        };
        // Persist the mock user session string representation to local storage
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        // Set the active user state context to the newly created mock user
        setUser(mockUser);
    // Close signInMockUser helper function declaration
    };

    // Define the custom logout helper function to intercept local sessions
    const handleLogout = async () => {
        // Check if the current location hostname matches local server paths
        const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        // Check if the environment is local
        if (isLocal) {
            // Remove the mock user session payload from local storage
            localStorage.removeItem('mock_user');
            // Remove the mock medications state data from local storage
            localStorage.removeItem('mock_medications');
            // Remove the mock logs state data from local storage
            localStorage.removeItem('mock_logs');
            // Reset the active user state context to null
            setUser(null);
            // Clear the local medications state list
            setMedications([]);
            // Clear the local logs state list
            setLogs([]);
        // End of local bypass check block
        } else {
            // Invoke the real Firebase logout function
            await logout();
        // End of conditional block check
        }
    // Close handleLogout function definition
    };

    return (
        <StoreContext.Provider value={{
            user,
            loading,
            signInWithGoogle,
            signInMockUser,
            // Use custom handleLogout instead of direct firebase logout
            logout: handleLogout,
            medications,
            logs,
            addMedication,
            updateMedication,
            deleteMedication,
            refillMedication,
            takeDose,
            takeDoseForDate,
            undoDose,
            selectedDate,
            changeWeek: (offset) => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() + (offset * 7));
                setSelectedDate(newDate);
            }
        }}>
            {children}
        </StoreContext.Provider>
    );
};
