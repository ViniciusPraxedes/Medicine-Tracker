import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db, signInWithGoogle, logout } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, getDoc } from 'firebase/firestore';

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
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                setMedications([]);
                setLogs([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Firestore Sync
    useEffect(() => {
        if (!user) return;

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



    // Actions
    const addMedication = async (med) => {
        const newMed = { ...med, id: crypto.randomUUID(), currentPills: parseInt(med.totalPills) };

        if (user) {
            try {
                await setDoc(doc(db, 'users', user.uid, 'medications', newMed.id), newMed);
            } catch (error) {
                console.error("Error adding medication:", error);
                alert("Failed to save medication. Please check your connection or permissions.");
            }
        } else {
            setMedications(prev => [...prev, newMed]);
        }
    };

    const updateMedication = async (id, updates) => {
        if (user) {
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
        if (user) {
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

        if (user) {
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

    const takeDose = async (medId) => {
        const med = medications.find(m => m.id === medId);
        if (!med) return;

        if (user) {
            try {
                await setDoc(doc(db, 'users', user.uid, 'medications', medId), { currentPills: Math.max(0, med.currentPills - 1) }, { merge: true });
                await logAction(medId, 'take');
            } catch (error) {
                console.error("Error taking dose:", error);
                alert("Failed to record dose.");
            }
        } else {
            setMedications(prev => prev.map(m => {
                if (m.id === medId) {
                    return { ...m, currentPills: Math.max(0, m.currentPills - 1) };
                }
                return m;
            }));
            logAction(medId, 'take');
        }
    };

    const undoDose = async (logId) => {
        const log = logs.find(l => l.id === logId);
        if (!log) return;

        if (user) {
            try {
                await deleteDoc(doc(db, 'users', user.uid, 'logs', logId));

                if (log.action === 'take') {
                    const med = medications.find(m => m.id === log.medicationId);
                    if (med) {
                        await setDoc(doc(db, 'users', user.uid, 'medications', med.id), { currentPills: med.currentPills + 1 }, { merge: true });
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

    const logAction = async (medicationId, action) => {
        const newLog = {
            id: crypto.randomUUID(),
            medicationId,
            action,
            timestamp: new Date().toISOString()
        };

        if (user) {
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

    return (
        <StoreContext.Provider value={{
            user,
            loading,
            signInWithGoogle,
            logout,
            medications,
            logs,
            addMedication,
            updateMedication,
            deleteMedication,
            refillMedication,
            takeDose,
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
