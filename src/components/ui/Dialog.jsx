import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = ({ open, onOpenChange, children }) => {
    // If dialog open is false return null
    if (!open) return null;

    // Render the dialog backdrop and contents container
    return (
        // Flex container aligning dialog to bottom on mobile, center on desktop
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop overlay element */}
            <div
                // Background dark layer with blur effect
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                // Trigger state change to close dialog on click
                onClick={() => onOpenChange(false)}
            />
            {/* Inner responsive width wrapper */}
            <div className="relative z-50 w-full sm:max-w-lg sm:mx-4">
                {/* Child content element */}
                {children}
            </div>
        </div>
    );
};

export const DialogContent = ({ children, className }) => {
    // Render the dialog content panel
    return (
        // Apply responsive rounded classes, animations, and sizes
        <div className={cn(
            // Styled card container with slide-up bottom sheet transitions on mobile
            "bg-card border rounded-t-2xl sm:rounded-lg shadow-lg p-6 max-h-[85vh] overflow-y-auto w-full animate-in fade-in slide-in-from-bottom duration-300 sm:zoom-in-95",
            className
        )}>
            {/* Child content nodes */}
            {children}
        </div>
    );
};

export const DialogHeader = ({ children, className }) => {
    return (
        <div className={cn("mb-4", className)}>
            {children}
        </div>
    );
};

export const DialogTitle = ({ children, className }) => {
    return (
        <h2 className={cn("text-xl font-bold", className)}>
            {children}
        </h2>
    );
};

export const DialogDescription = ({ children, className }) => {
    return (
        <p className={cn("text-sm text-muted-foreground mt-1", className)}>
            {children}
        </p>
    );
};

export const DialogClose = ({ onClose, className }) => {
    return (
        <button
            onClick={onClose}
            className={cn(
                "absolute top-4 right-4 p-1 rounded-md hover:bg-accent transition-colors",
                className
            )}
        >
            <X className="h-4 w-4" />
        </button>
    );
};
