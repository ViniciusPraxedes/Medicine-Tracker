import React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
    // Render the base Card element with rounded-2xl and transition styles
    <div
        ref={ref}
        // Tailwind classes for modern curved corners and soft interactive shadow styling
        className={cn("rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-300", className)}
        {...props}
    />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
