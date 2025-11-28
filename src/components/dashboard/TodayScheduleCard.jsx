import React from 'react';
import { Check, RotateCcw, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/context/StoreContext';
import { cn } from '@/lib/utils';

const TodayScheduleCard = () => {
    const { medications, logs, takeDose, undoDose } = useStore();

    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue...
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // Filter medications scheduled for today
    const todaysMeds = medications.filter(med =>
        med.schedule.days.includes(dayName)
    );

    // Generate dose items
    const doses = [];
    todaysMeds.forEach(med => {
        med.schedule.times.forEach(time => {
            // Check if taken today
            // We look for a log entry for this med, with action 'take', on this date
            // Note: This simple logic assumes one dose per time slot. 
            // For more complex tracking (multiple doses of same med at same time?), we'd need unique dose IDs or better log matching.
            // Here we'll match by approximate time window or just count taken vs scheduled.
            // A robust way is to check if there's a log for this med today at this time.
            // Since logs store ISO timestamp, we check if any log matches the date and is "close enough" to the scheduled time or just exists for today if frequency is 1.
            // Let's simplify: We'll check if there's a log for this med on this day. 
            // If a med is taken multiple times a day, we need to match specific times.
            // For this MVP, let's assume if you have 2 doses, you need 2 logs.
            // We'll sort logs by time and match them to scheduled times.

            const medLogsToday = logs.filter(l =>
                l.medicationId === med.id &&
                l.action === 'take' &&
                l.timestamp.startsWith(dateStr)
            ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            // This is tricky without specific dose tracking. 
            // Let's try a simpler UI approach: List all scheduled times. 
            // If there are N scheduled times, and M logs, we mark the first M as taken? 
            // Or we try to match the time.

            // Let's try matching by time.
            // We'll consider a dose "taken" if there's a log within 2 hours of the scheduled time? 
            // Or just let the user check them off one by one.

            // Better approach for MVP:
            // Display each scheduled time as a distinct item.
            // Find a log that "matches" this time. 
            // Since we don't store "scheduledTime" in the log, we can't perfectly map back.
            // BUT, we can just show the list. When user clicks "Take", we log it.
            // To know if THIS specific 08:00 dose is taken, we'd need to link the log to the schedule time.
            // Let's just show the list of scheduled doses.
            // We'll map logs to the closest scheduled time for display purposes?
            // Or simpler: Just show "Scheduled: 08:00, 20:00". 
            // And show "Taken: 08:05".

            // Let's go with: List all scheduled doses.
            // Mark as taken if there is a log entry that hasn't been "used" by another dose item yet?
            // That's complex.

            // Alternative: Just show the list. User clicks "Take" on a specific time.
            // We log { medicationId, scheduledTime: "08:00", action: "take" ... }
            // We need to update the log structure to support this, or just infer it.
            // Let's update the logAction to accept metadata.

            doses.push({
                id: `${med.id}-${time}`, // Pseudo ID
                medication: med,
                time: time,
                taken: false, // Will calculate below
                logId: null
            });
        });
    });

    // Sort by time
    doses.sort((a, b) => a.time.localeCompare(b.time));

    // Now try to match logs to doses
    // We'll simple match logs to the earliest untaken dose of that med?
    // Or just iterate logs and mark doses as taken.
    const takenLogs = logs.filter(l =>
        l.action === 'take' && l.timestamp.startsWith(dateStr)
    );

    // We need a way to know WHICH dose was taken.
    // Since we didn't plan for `scheduledTime` in logs, let's just use a greedy matching for now.
    // For each log of med X, mark the earliest scheduled dose of med X as taken.

    const processedLogs = new Set();

    doses.forEach(dose => {
        const log = takenLogs.find(l =>
            l.medicationId === dose.medication.id && !processedLogs.has(l.id)
        );
        if (log) {
            dose.taken = true;
            dose.logId = log.id;
            processedLogs.add(log.id);
        }
    });

    const handleTake = (dose) => {
        takeDose(dose.medication.id);
    };

    const handleUndo = (dose) => {
        if (dose.logId) {
            undoDose(dose.logId);
        }
    };

    return (
        <Card className="col-span-1 h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Today's Schedule
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                {doses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <p>No medications scheduled for today.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {doses.map((dose) => (
                            <div
                                key={dose.id}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                                    dose.taken
                                        ? "bg-primary/10 border-primary/20"
                                        : "bg-card hover:bg-accent/5"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-xs",
                                        dose.taken ? "border-primary text-primary bg-background" : "border-muted-foreground text-muted-foreground"
                                    )}>
                                        {dose.time}
                                    </div>
                                    <div>
                                        <h4 className={cn("font-semibold", dose.taken && "text-primary")}>
                                            {dose.medication.name}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                            {dose.medication.dosage} • {dose.medication.relationToFood === 'with_food' ? 'With food' : 'No food'}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    variant={dose.taken ? "outline" : "default"}
                                    onClick={() => dose.taken ? handleUndo(dose) : handleTake(dose)}
                                    className={cn(
                                        "gap-1 min-w-[80px]",
                                        dose.taken && "text-muted-foreground hover:text-primary"
                                    )}
                                >
                                    {dose.taken ? (
                                        <>
                                            <RotateCcw className="h-3 w-3" /> Taken
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-3 w-3" /> Take
                                        </>
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TodayScheduleCard;
