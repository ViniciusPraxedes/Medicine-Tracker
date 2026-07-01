import React, { useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import Layout from './components/Layout';
import Dashboard from './components/dashboard/Dashboard';

function App() {
  return (
    <StoreProvider>
      <AuthWrapper />
    </StoreProvider>
  );
}

import { useStore } from './context/StoreContext';
import Login from './components/Login';
import { listenForMessages } from './lib/firebase';

const AuthWrapper = () => {
  const { user, loading, medications = [], logs = [] } = useStore();

  useEffect(() => {
    if (user) {
      // Local mock interval for testing snooze
      const interval = setInterval(() => {
        const now = new Date();
        const userDay = now.toLocaleDateString("en-US", { weekday: "short" });
        const localTimeStr = now.toLocaleTimeString("en-US", { hour12: false });
        const [currHour, currMinute, currSecond] = localTimeStr.split(":").map(Number);
        const currSec = currHour * 3600 + currMinute * 60 + (currSecond || 0);
        
        let dateStr = "";
        try {
          const parts = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
          dateStr = `${parts.find(p=>p.type==='year').value}-${parts.find(p=>p.type==='month').value}-${parts.find(p=>p.type==='day').value}`;
        } catch(e) {
          dateStr = now.toISOString().split('T')[0];
        }

        const takenLogs = logs.filter(l => l.action === 'take' && l.timestamp && l.timestamp.startsWith(dateStr));
        const doses = [];

        medications.forEach(med => {
          if (med.remindersEnabled !== false && med.schedule && med.schedule.days?.includes(userDay)) {
            med.schedule.times.forEach(timeStr => {
              doses.push({
                medicationId: med.id,
                medicationName: med.name,
                snoozeIntervalSec: med.snoozeInterval !== undefined ? Number(med.snoozeInterval) : 10,
                time: timeStr,
                taken: false
              });
            });
          }
        });

        doses.sort((a, b) => a.time.localeCompare(b.time));
        const processedLogs = new Set();
        doses.forEach(dose => {
          const matchingLog = takenLogs.find(l => l.medicationId === dose.medicationId && !processedLogs.has(l.id));
          if (matchingLog) {
            dose.taken = true;
            processedLogs.add(matchingLog.id);
          }
        });

        doses.forEach(dose => {
          if (!dose.taken) {
            const [schedHour, schedMinute] = dose.time.split(":").map(Number);
            const schedSec = schedHour * 3600 + schedMinute * 60;
            const diffSec = currSec - schedSec;

            if (diffSec >= 0) {
              let shouldNotify = false;
              if (diffSec === 0) {
                shouldNotify = true;
              } else if (dose.snoozeIntervalSec > 0 && diffSec % dose.snoozeIntervalSec === 0) {
                shouldNotify = true;
              }

              if (shouldNotify) {
                const isSnooze = diffSec > 0;
                // Add console log to easily see in the browser if testing
                console.log(`[Testing Mock] Triggered alert for ${dose.medicationName}`);
                alert(`[TEST] 🔔 ${isSnooze ? 'Snooze: ' : 'Reminder: '}${dose.medicationName}\nYou missed your scheduled dose of ${dose.medicationName} (${dose.time}). Please take it and mark it as taken.`);
              }
            }
          }
        });
      }, 1000);

      const unsubscribe = listenForMessages((payload) => {
        console.log('Message received in foreground: ', payload);
        // Trigger a browser alert with the message payload title and body
        alert(`🔔 ${payload?.notification?.title || 'New Notification'}\n${payload?.notification?.body || ''}`);
      });
      // listenForMessages does not return an unsubscribe function in the v9 modular SDK usually
      // but if it does, it's safe to return it.
      return () => {
        clearInterval(interval);
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [user, medications, logs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary">Medicine Tracker</h1>
          <p className="text-muted-foreground">Sign in to manage your medications and track your progress.</p>
          <div className="flex justify-center">
            <Login />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

export default App;
