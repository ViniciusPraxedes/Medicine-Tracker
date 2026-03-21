import React, { useState } from 'react';
import { History, Package, PlusCircle, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/context/StoreContext';

const PackHistoryCard = () => {
    const { logs, medications } = useStore();
    const [visibleCount, setVisibleCount] = useState(5);

    // Filter refill and add logs
    const allHistoryLogs = logs
        .filter(l => l.action === 'refill' || l.action === 'add')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
    const historyLogs = allHistoryLogs.slice(0, visibleCount);

    const getMedName = (log) => {
        if (log.medicationName) return log.medicationName;
        // Fallback for older logs
        const med = medications.find(m => m.id === log.medicationId);
        return med ? med.name : 'Unknown Medication';
    };

    return (
        <Card className="col-span-1 h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Pack History
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                {historyLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <Package className="h-8 w-8 mb-2 opacity-50" />
                        <p>No pack history.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {historyLogs.map((log) => (
                            <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                                    {log.action === 'add' ? (
                                        <PlusCircle className="h-4 w-4 text-primary" />
                                    ) : (
                                        <Package className="h-4 w-4 text-primary" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{getMedName(log)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {log.action === 'add' ? 'Added on ' : 'Refilled on '}
                                        {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        
                        {allHistoryLogs.length > visibleCount && (
                            <Button 
                                variant="ghost" 
                                className="w-full mt-2 text-muted-foreground"
                                onClick={() => setVisibleCount(prev => prev + 5)}
                            >
                                <ChevronDown className="h-4 w-4 mr-2" />
                                See more
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PackHistoryCard;
