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
  const { user, loading } = useStore();

  useEffect(() => {
    if (user) {
      const unsubscribe = listenForMessages((payload) => {
        console.log('Message received in foreground: ', payload);
        alert(`🔔 Reminder: ${payload?.notification?.title || 'New Notification'}\n${payload?.notification?.body || ''}`);
      });
      // listenForMessages does not return an unsubscribe function in the v9 modular SDK usually
      // but if it does, it's safe to return it.
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [user]);

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
