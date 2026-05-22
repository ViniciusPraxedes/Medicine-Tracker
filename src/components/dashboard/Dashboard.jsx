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
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Manage your medications and track adherence.</p>
                </div>
                {!permissionGranted && (
                    <button
                        onClick={handleEnableNotifications}
                        disabled={isRequesting}
                        className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                        <Bell className="w-5 h-5" />
                        {isRequesting ? 'Enabling...' : 'Enable Reminders'}
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
