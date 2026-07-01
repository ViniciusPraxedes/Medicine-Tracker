// Import React and the useState hook
import React, { useState } from 'react';
import MyMedicationsCard from './MyMedicationsCard';
import TodayScheduleCard from './TodayScheduleCard';
import WeekProgressCard from './WeekProgressCard';
import PackHistoryCard from './PackHistoryCard';
import { requestNotificationPermission } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';
import { Bell } from 'lucide-react';

const Dashboard = () => {
    const { user } = useStore();
    const [isRequesting, setIsRequesting] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(Notification.permission === 'granted');

    // Get the current hour of the system
    const currentHour = new Date().getHours();
    // Initialize greeting string variable
    let greeting = "Hello";
    // Check if the current time is morning
    if (currentHour < 12) {
        // Set greeting to good morning
        greeting = "Good morning";
    // Check if the current time is afternoon
    } else if (currentHour < 18) {
        // Set greeting to good afternoon
        greeting = "Good afternoon";
    // Otherwise it is evening
    } else {
        // Set greeting to good evening
        greeting = "Good evening";
    }

    const handleEnableNotifications = async () => {
        if (!user) return;
        setIsRequesting(true);
        const token = await requestNotificationPermission(user.uid);
        setIsRequesting(false);
        if (token) {
            setPermissionGranted(true);
            alert("Notifications enabled! You will receive reminders for your medication.");
        } else {
            alert("Could not enable notifications. Please check your browser settings or try again.");
        }
    };
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
                <div>
                    {/* Render dynamic greeting text based on time of day and username */}
                    <h1 className="text-3xl font-bold tracking-tight">
                        {greeting}, {user?.displayName ? user.displayName.split(' ')[0] : 'User'}
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage your medications and track adherence.</p>
                </div>
                {!permissionGranted && (
                    <button
                        onClick={handleEnableNotifications}
                        disabled={isRequesting}
                        className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                        <Bell className="w-5 h-5" />
                        {/* Show loading text while requesting permission, otherwise show default label */}
                        {isRequesting ? 'Enabling...' : 'Enable notifications'}
                    </button>
                )}
            </div>

            <MyMedicationsCard />
            <TodayScheduleCard />
            <WeekProgressCard />
            <PackHistoryCard />
        </div>
    );
};

export default Dashboard;
