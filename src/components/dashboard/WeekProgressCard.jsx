import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useStore } from '@/context/StoreContext';

const WeekProgressCard = () => {
    const { logs, medications, selectedDate, changeWeek } = useStore();

    // Calculate Week Number (ISO 8601)
    const getWeekNumber = (d) => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    };
    const currentWeek = getWeekNumber(selectedDate);

    // Get start of week (Monday) and end of week (Sunday)
    const getWeekRange = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const start = new Date(d.setDate(diff));
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return { start, end };
    };

    const { start: weekStart, end: weekEnd } = getWeekRange(selectedDate);

    // Calculate data for the selected week (Mon-Sun)
    const data = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
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

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-2 h-[350px] flex flex-col">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    Weekly Adherence (Week {currentWeek})
                </CardTitle>
                <div className="flex items-center gap-2">
                    <button onClick={() => changeWeek(-1)} className="p-1 hover:bg-muted rounded text-lg font-bold">&lt;</button>
                    <span className="text-sm font-medium">{formatDate(weekStart)} - {formatDate(weekEnd)}</span>
                    <button onClick={() => changeWeek(1)} className="p-1 hover:bg-muted rounded text-lg font-bold">&gt;</button>
                </div>
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
