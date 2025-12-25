import React, { useState } from 'react';
import { Check, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/context/StoreContext';
import { cn } from '@/lib/utils';

const MarkMissedDoseDialog = ({ open, onOpenChange, selectedDate }) => {
    const { medications, logs, takeDoseForDate } = useStore();
    const [processing, setProcessing] = useState(false);

    if (!selectedDate) return null;

    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
    const displayDate = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    // Get medications scheduled for this day
    const scheduledMeds = medications.filter(med =>
        med.schedule.days.includes(dayName)
    );

    // Build list of all scheduled doses
    const doses = [];
    scheduledMeds.forEach(med => {
        med.schedule.times.forEach(time => {
            doses.push({
                id: `${med.id}-${time}`,
                medication: med,
                time: time,
                taken: false,
                logId: null
            });
        });
    });

    // Sort by time
    doses.sort((a, b) => a.time.localeCompare(b.time));

    // Match logs to doses
    const takenLogs = logs.filter(l =>
        l.action === 'take' && l.timestamp.startsWith(dateStr)
    );

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

    const handleMarkAsTaken = async (dose) => {
        setProcessing(true);
        try {
            await takeDoseForDate(dose.medication.id, dateStr, dose.time);
        } catch (error) {
            console.error('Error marking dose as taken:', error);
        } finally {
            setProcessing(false);
        }
    };

    const missedDoses = doses.filter(d => !d.taken);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogClose onClose={() => onOpenChange(false)} />
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Mark Missed Doses
                    </DialogTitle>
                    <DialogDescription>
                        {displayDate}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-4">
                    {doses.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No medications scheduled for this day.
                        </div>
                    ) : missedDoses.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                                <Check className="h-6 w-6 text-primary" />
                            </div>
                            <p className="font-medium">All doses taken!</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                You've completed all scheduled medications for this day.
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground mb-2">
                                Mark missed doses as taken:
                            </p>
                            {doses.map((dose) => (
                                <div
                                    key={dose.id}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-lg border transition-all",
                                        dose.taken
                                            ? "bg-primary/10 border-primary/20 opacity-60"
                                            : "bg-card hover:bg-accent/5"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-xs",
                                            dose.taken
                                                ? "border-primary text-primary bg-background"
                                                : "border-muted-foreground text-muted-foreground"
                                        )}>
                                            {dose.time}
                                        </div>
                                        <div>
                                            <h4 className={cn("font-semibold", dose.taken && "text-primary")}>
                                                {dose.medication.name}
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                                {dose.medication.dosage}
                                            </p>
                                        </div>
                                    </div>

                                    {dose.taken ? (
                                        <div className="flex items-center gap-1 text-primary text-sm font-medium">
                                            <Check className="h-4 w-4" />
                                            Taken
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() => handleMarkAsTaken(dose)}
                                            disabled={processing}
                                            className="gap-1"
                                        >
                                            <Check className="h-3 w-3" />
                                            Mark Taken
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MarkMissedDoseDialog;
