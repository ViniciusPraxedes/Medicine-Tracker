import React, { useState } from 'react';
// Import Lucide icons for UI representation including notification toggle symbols
import { Plus, Pill, Edit2, Trash2, RefreshCw, Bell, BellOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/context/StoreContext';
import AddEditMedicationDialog from './AddEditMedicationDialog';

const MyMedicationsCard = () => {
    const { medications, deleteMedication, refillMedication } = useStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMed, setEditingMed] = useState(null);

    const handleEdit = (med) => {
        setEditingMed(med);
        setIsDialogOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this medication?')) {
            deleteMedication(id);
        }
    };

    const handleAddNew = () => {
        setEditingMed(null);
        setIsDialogOpen(true);
    };

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-2 h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    My Medications
                </CardTitle>
                <Button size="sm" onClick={handleAddNew} className="gap-1">
                    <Plus className="h-4 w-4" /> Add New
                </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                {medications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <Pill className="h-8 w-8 mb-2 opacity-50" />
                        <p>No medications added yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {medications.map((med) => (
                            <div
                                key={med.id}
                                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                            >
                                <div className="space-y-1">
                                    <h3 className="font-semibold leading-none">{med.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {med.dosage} • {med.currentPills}/{med.totalPills} pills left
                                    </p>
                                    {/* Text display containing medication schedule times and frequencies */}
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                                        {/* Label and schedule values */}
                                        <span>Schedule: {med.schedule.times.join(', ')} ({med.schedule.days.length === 7 ? 'Daily' : med.schedule.days.join(', ')})</span>
                                        {/* Render active or muted bell indicator based on remindersEnabled setting */}
                                        {med.remindersEnabled !== false ? (
                                            // Active reminder badge
                                            <span className="flex items-center text-primary gap-0.5 text-[10px] font-medium bg-primary/10 px-1.5 py-0.5 rounded" title="Reminders active">
                                                {/* Active Bell icon */}
                                                <Bell className="h-2.5 w-2.5" /> Active
                                            </span>
                                        ) : (
                                            // Muted reminder badge
                                            <span className="flex items-center text-muted-foreground gap-0.5 text-[10px] font-medium bg-accent/30 px-1.5 py-0.5 rounded" title="Reminders muted">
                                                {/* Muted BellOff icon */}
                                                <BellOff className="h-2.5 w-2.5" /> Muted
                                            </span>
                                        )}
                                    {/* End of schedule info block */}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => refillMedication(med.id)}
                                        className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    >
                                        <RefreshCw className="h-3 w-3" /> Reset
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(med)}
                                        title="Edit"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(med.id)}
                                        title="Delete"
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            {isDialogOpen && (
                <AddEditMedicationDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    medicationToEdit={editingMed}
                />
            )}
        </Card>
    );
};

export default MyMedicationsCard;
