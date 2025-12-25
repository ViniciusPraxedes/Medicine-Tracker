import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = ({ open, onOpenChange, children }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />
            {/* Dialog Content */}
            <div className="relative z-50 w-full max-w-lg mx-4">
                {children}
            </div>
        </div>
    );
};

export const DialogContent = ({ children, className }) => {
    return (
        <div className={cn(
            "bg-card border rounded-lg shadow-lg p-6 max-h-[85vh] overflow-y-auto",
            className
        )}>
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
