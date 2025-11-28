import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import { useStore } from '@/context/StoreContext';

const DAYS = [
    { id: 'Mon', label: 'M' },
    { id: 'Tue', label: 'T' },
    { id: 'Wed', label: 'W' },
    { id: 'Thu', label: 'T' },
    { id: 'Fri', label: 'F' },
    { id: 'Sat', label: 'S' },
    { id: 'Sun', label: 'S' },
];

const AddEditMedicationDialog = ({ isOpen, onClose, medicationToEdit }) => {
    const { addMedication, updateMedication } = useStore();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        totalPills: '',
        frequency: 'daily',
        relationToFood: 'with_food',
        schedule: {
            times: ['08:00'],
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        }
    });

    useEffect(() => {
        if (medicationToEdit) {
            setFormData(medicationToEdit);
        }
    }, [medicationToEdit]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (step === 1) {
            setStep(2);
            return;
        }

        if (medicationToEdit) {
            updateMedication(medicationToEdit.id, formData);
        } else {
            addMedication(formData);
        }
        onClose();
    };

    const toggleDay = (dayId) => {
        setFormData(prev => {
            const days = prev.schedule.days.includes(dayId)
                ? prev.schedule.days.filter(d => d !== dayId)
                : [...prev.schedule.days, dayId];
            return { ...prev, schedule: { ...prev.schedule, days } };
        });
    };

    const addTime = () => {
        setFormData(prev => ({
            ...prev,
            schedule: { ...prev.schedule, times: [...prev.schedule.times, '08:00'] }
        }));
    };

    const updateTime = (index, value) => {
        const newTimes = [...formData.schedule.times];
        newTimes[index] = value;
        setFormData(prev => ({
            ...prev,
            schedule: { ...prev.schedule, times: newTimes }
        }));
    };

    const removeTime = (index) => {
        const newTimes = formData.schedule.times.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            schedule: { ...prev.schedule, times: newTimes }
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                        {medicationToEdit ? 'Edit Medication' : 'Add New Medication'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Medication Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. Amoxicillin"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="dosage">Dosage</Label>
                                    <Input
                                        id="dosage"
                                        value={formData.dosage}
                                        onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                                        required
                                        placeholder="e.g. 500mg"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="totalPills">Pack Size</Label>
                                    <Input
                                        id="totalPills"
                                        type="number"
                                        value={formData.totalPills}
                                        onChange={(e) => setFormData({ ...formData, totalPills: e.target.value })}
                                        required
                                        placeholder="e.g. 30"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Relation to Food</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={formData.relationToFood}
                                    onChange={(e) => setFormData({ ...formData, relationToFood: e.target.value })}
                                >
                                    <option value="with_food">With Food</option>
                                    <option value="without_food">Without Food</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label>Intake Times</Label>
                                {formData.schedule.times.map((time, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            type="time"
                                            value={time}
                                            onChange={(e) => updateTime(index, e.target.value)}
                                            required
                                        />
                                        {formData.schedule.times.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeTime(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={addTime}>
                                    Add Another Time
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <Label>Frequency (Days)</Label>
                                <div className="flex justify-between gap-1">
                                    {DAYS.map((day) => (
                                        <div key={day.id} className="flex flex-col items-center gap-1">
                                            <Checkbox
                                                checked={formData.schedule.days.includes(day.id)}
                                                onCheckedChange={() => toggleDay(day.id)}
                                            />
                                            <span className="text-xs text-muted-foreground">{day.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        {step === 2 && (
                            <Button type="button" variant="outline" onClick={() => setStep(1)}>
                                Back
                            </Button>
                        )}
                        <Button type="submit">
                            {step === 1 ? 'Next' : (medicationToEdit ? 'Save Changes' : 'Add Medication')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditMedicationDialog;
