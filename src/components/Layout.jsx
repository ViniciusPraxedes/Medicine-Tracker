// Import React library
import React from 'react';
// Import Login component for authentication controls
import Login from './Login';
// Import store context hook to access current user state
import { useStore } from '@/context/StoreContext';

// Define the Layout component wrapping all pages
const Layout = ({ children }) => {
    // Destructure the current user object from store context
    const { user } = useStore();

    // Render the full page layout with sticky header and main content
    return (
        // Root wrapper with minimum full screen height and base styles
        <div className="min-h-screen bg-background font-sans antialiased">
            {/* Sticky top navigation header */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                {/* Inner container with horizontal flex layout */}
                <div className="container flex h-14 max-w-screen-2xl items-center px-4">
                    {/* Left section: user account info shown when logged in */}
                    <div className="flex flex-col justify-center min-w-0">
                        {/* Conditionally render user name if user is authenticated */}
                        {user && (
                            // User info block showing display name and email
                            <div className="flex flex-col leading-tight">
                                {/* Display the authenticated user's name */}
                                <span className="text-sm font-semibold text-foreground truncate max-w-[180px]">
                                    {user.displayName}
                                </span>
                                {/* Display the authenticated user's email address */}
                                <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                                    {user.email}
                                </span>
                            </div>
                        )}
                        {/* Show app name on desktop when no user is logged in */}
                        {!user && (
                            // App name anchor link for branding when unauthenticated
                            <a className="flex items-center space-x-2" href="/">
                                {/* Hidden on mobile, visible on sm and above */}
                                <span className="hidden font-bold sm:inline-block">
                                    Medicine Tracker
                                </span>
                            </a>
                        )}
                    </div>
                    {/* Right section: login/logout controls pushed to the right */}
                    <div className="flex-1 flex justify-end">
                        {/* Login component renders sign-in button or sign-out button */}
                        <Login />
                    </div>
                </div>
            </header>
            {/* Main content area with responsive padding */}
            <main className="container max-w-screen-2xl p-4 md:p-8">
                {/* Render child page components */}
                {children}
            </main>
        </div>
    );
};

// Export Layout as the default export
export default Layout;
