import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useStore } from '@/context/StoreContext';

const WeekProgressCard = () => {
    const { logs, medications } = useStore();

    // Calculate Week Number (ISO 8601)
    const getWeekNumber = (d) => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    };
    const currentWeek = getWeekNumber(new Date());

    // Calculate data for the last 7 days
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

        // Calculate scheduled doses for this day
        let scheduledCount = 0;
        medications.forEach(med => {
            if (med.schedule.days.includes(dayName)) {
                scheduledCount += med.schedule.times.length;
            }
        });

        // Calculate taken doses for this day
        const takenCount = logs.filter(l =>
            l.action === 'take' && l.timestamp.startsWith(dateStr)
        ).length;

        // Calculate skipped (scheduled - taken, but not negative)
        const skippedCount = Math.max(0, scheduledCount - takenCount);

        data.push({
            name: dayName,
            Taken: takenCount,
            Skipped: skippedCount
        });
    }

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-2 h-[350px] flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    Weekly Adherence (Week {currentWeek})
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend iconType="circle" />
                        <Bar dataKey="Taken" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="Skipped" stackId="a" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default WeekProgressCard;
