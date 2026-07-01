// Import React and useState hook from React library
import React, { useState } from 'react';
// Import Login component for authentication controls
import Login from './Login';
// Import store context hook to access current user state
import { useStore } from '@/context/StoreContext';
// Import User, LogOut, ChevronDown icons from lucide-react
import { User, LogOut, ChevronDown } from 'lucide-react';

// Define the Layout component wrapping all pages
const Layout = ({ children }) => {
    // Destructure the current user and logout function from store context
    const { user, logout } = useStore();
    // Declare a state variable to track if the profile dropdown is open
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Render the full page layout with sticky header and main content
    return (
        // Root wrapper with minimum full screen height and base styles
        <div className="min-h-screen bg-background font-sans antialiased">
            {/* Relative top navigation header */}
            <header className="relative z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                {/* Inner container with horizontal flex layout */}
                <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
                    {/* Left section: app brand branding */}
                    <div className="flex items-center space-x-2">
                        {/* App name link pointing home */}
                        <a className="flex items-center space-x-2" href="/">
                            {/* Standard brand text */}
                            <span className="font-bold text-lg text-primary">
                                Medicine Tracker
                            </span>
                        </a>
                    </div>
                    {/* Right section: profile avatar trigger or sign-in block */}
                    <div className="relative flex items-center gap-2">
                        {/* Conditionally render profile avatar if user is authenticated */}
                        {user ? (
                            // Avatar container button with click handler
                            <button
                                // Toggle profile state on click
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                // Interactive hover/focus styling
                                className="flex items-center gap-1.5 focus:outline-none"
                            >
                                {/* Circle wrapper with gradient boundary */}
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
                                    {/* Get first character of user displayName or fallback to U */}
                                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                {/* Small chevron indicator */}
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </button>
                        ) : (
                            // Render Login sign-in button when unauthenticated
                            <Login />
                        )}
                        {/* Render profile dropdown when open and user is logged in */}
                        {user && isProfileOpen && (
                            // Dropdown card wrapper container
                            <div className="absolute right-0 top-10 z-50 w-56 rounded-xl border bg-card p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* Details container wrapping text attributes */}
                                <div className="flex flex-col space-y-1 pb-3 border-b">
                                    {/* Span holding user display name */}
                                    <span className="text-sm font-semibold text-foreground truncate">
                                        {user.displayName}
                                    </span>
                                    {/* Span holding user email */}
                                    <span className="text-xs text-muted-foreground truncate">
                                        {user.email}
                                    </span>
                                </div>
                                {/* Sign out button */}
                                <button
                                    // Trigger logout and close popover
                                    onClick={() => {
                                        // Invoke store logout
                                        logout();
                                        // Hide dropdown modal
                                        setIsProfileOpen(false);
                                    }}
                                    // Styled button class list
                                    className="mt-3 flex w-full items-center gap-2 text-sm text-destructive hover:text-destructive/80 font-medium pt-1"
                                >
                                    {/* Icon component for log out action */}
                                    <LogOut className="h-4 w-4" />
                                    {/* Text display label */}
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            {/* Main content area with responsive padding */}
            <main className="container max-w-screen-2xl p-4">
                {/* Render child page components */}
                {children}
            </main>
        </div>
    );
};

// Export Layout as the default export
export default Layout;

