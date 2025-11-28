import React from 'react';
import MyMedicationsCard from './MyMedicationsCard';
import TodayScheduleCard from './TodayScheduleCard';
import WeekProgressCard from './WeekProgressCard';
import PackHistoryCard from './PackHistoryCard';

const Dashboard = () => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Manage your medications and track adherence.</p>
            </div>

            <MyMedicationsCard />
            <TodayScheduleCard />
            <WeekProgressCard />
            <PackHistoryCard />
        </div>
    );
};

export default Dashboard;
