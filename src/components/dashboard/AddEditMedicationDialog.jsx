// Import React and the useState hook
import React, { useState } from 'react';
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
        // Enable medication push reminders by default
        remindersEnabled: true,
        // Set the default snooze interval in minutes
        snoozeInterval: 10,
        schedule: {
            times: ['08:00'],
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        }
    });

    // Track the medication object being edited to detect updates
    const [prevMedication, setPrevMedication] = useState(null);
    // If the medication to edit prop changes, synchronize the local form data
    if (medicationToEdit !== prevMedication) {
        // Update the tracked previous medication state
        setPrevMedication(medicationToEdit);
        // Reset the form values to match the medication being edited, or default state
        setFormData(medicationToEdit ? {
            // Copy all properties from the medication being edited
            ...medicationToEdit,
            // Ensure remindersEnabled is defaulted to true if not explicitly false
            remindersEnabled: medicationToEdit.remindersEnabled !== false,
            // Set snooze interval from edit medication or default to 10 minutes
            snoozeInterval: medicationToEdit.snoozeInterval !== undefined ? medicationToEdit.snoozeInterval : 10
        // Fallback to the default form state configuration if creating new medication
        } : {
            // Preset name field value
            name: '',
            // Preset dosage field value
            dosage: '',
            // Preset total pills field value
            totalPills: '',
            // Preset frequency type selection
            frequency: 'daily',
            // Preset food relationship setting
            relationToFood: 'with_food',
            // Enable medication push reminders by default
            remindersEnabled: true,
            // Set default snooze interval in minutes
            snoozeInterval: 10,
            // Preset schedule configuration mapping
            schedule: {
                // Default array of intake times
                times: ['08:00'],
                // Default array of days scheduled
                days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            // End of schedule configuration
            }
        // End of setFormData call
        });
        // Reset dialog page step to 1
        setStep(1);
    // End of medication comparison check
    }

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

    // Render the dialog overlay with conditional centering/bottom alignment
    return (
        // Backdrop overlay styled to center content on desktop and place at bottom on mobile
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
            {/* Slide-up dialog container layout for mobile, centered on larger viewports */}
            <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border bg-background p-6 shadow-lg animate-in fade-in slide-in-from-bottom duration-300 sm:zoom-in-95">
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

                            {/* Container for enabling push notification reminders */}
                            <div className="flex items-center gap-2 border-t pt-4">
                                {/* Checkbox component to toggle reminders state */}
                                <Checkbox
                                    // Set checkbox unique identifier
                                    id="remindersEnabled"
                                    // Bind checkbox checked status to form data setting
                                    checked={formData.remindersEnabled}
                                    // Update state context when checkbox status toggles
                                    onCheckedChange={(checked) => setFormData(prev => ({
                                        // Merge previous form fields
                                        ...prev,
                                        // Update remindersEnabled attribute with check state
                                        remindersEnabled: !!checked
                                    // End of form state update block
                                    }))}
                                // End checkbox attributes
                                />
                                {/* Text label pointing to the reminders toggle */}
                                <Label htmlFor="remindersEnabled" className="cursor-pointer">
                                    {/* String indicating push notification option */}
                                    Enable push notifications / reminders for this medicine
                                {/* End of label element */}
                                </Label>
                            {/* End layout container */}
                            </div>

                            {/* Conditional rendering based on whether push notification reminders are enabled */}
                            {formData.remindersEnabled && (
                                <div className="grid gap-2 border-t pt-4">
                                    {/* Text label element indicating snooze configuration field */}
                                    <Label htmlFor="snoozeInterval">Snooze Interval</Label>
                                    {/* Dropdown element to capture custom snooze interval duration */}
                                    <select
                                        // Set select field unique HTML identifier
                                        id="snoozeInterval"
                                        // Select element styling classes
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        // Bind input value context to the snoozeInterval state attribute
                                        value={formData.snoozeInterval}
                                        // Update state with parsed snooze interval duration
                                        onChange={(e) => setFormData({ ...formData, snoozeInterval: parseInt(e.target.value) })}
                                    // Close select element opening tag properties
                                    >
                                        {/* Dropdown option for one minute snooze frequency */}
                                        <option value="1">Every 1 minute</option>
                                        {/* Dropdown option for five minutes snooze frequency */}
                                        <option value="5">Every 5 minutes</option>
                                        {/* Dropdown option for ten minutes snooze frequency */}
                                        <option value="10">Every 10 minutes</option>
                                        {/* Dropdown option for fifteen minutes snooze frequency */}
                                        <option value="15">Every 15 minutes</option>
                                        {/* Dropdown option for thirty minutes snooze frequency */}
                                        <option value="30">Every 30 minutes</option>
                                        {/* Dropdown option to completely disable notification snooze */}
                                        <option value="0">No snooze (Notify once)</option>
                                    {/* Close select dropdown tag */}
                                    </select>
                                {/* Close form field layout container */}
                                </div>
                            )}
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
