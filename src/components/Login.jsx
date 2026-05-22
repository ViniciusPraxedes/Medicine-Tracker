// Import the React library
import React from 'react';
// Import the LogIn and LogOut icons from lucide-react
import { LogIn, LogOut } from 'lucide-react';
// Import the Button component from UI directory
import { Button } from '@/components/ui/Button';
// Import the store context hook to access state
import { useStore } from '@/context/StoreContext';

// Define the Login component
const Login = () => {
    // Destructure properties from the store context hook
    const { user, signInWithGoogle, signInMockUser, logout } = useStore();
    // Check if the current location hostname matches local server paths
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    // Check if the user is authenticated in the system
    if (user) {
        // Render only the sign out button when user is authenticated
        return (
            // Wrapper for the sign out button
            <div className="flex items-center">
                {/* Button to trigger logout procedure from store provider */}
                <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                    {/* Log out icon visual indicator */}
                    <LogOut className="h-4 w-4" />
                    {/* Label text to indicate sign out action */}
                    Sign Out
                {/* Close sign out button */}
                </Button>
            {/* Close wrapper */}
            </div>
        );
    // Close conditional authenticated block
    }

    // Render button component for users to authenticate
    return (
        // Flex container to stack buttons vertically
        <div className="flex flex-col gap-2 w-full">
            {/* Render Google sign-in button only when deployed to production */}
            {!isLocal && (
                // Google authentication trigger button
                // Render button component for Google authentication
                <Button onClick={signInWithGoogle} className="gap-2">
                    {/* Login icon visual indicator */}
                    <LogIn className="h-4 w-4" />
                    {/* Label string for Google authentication */}
                    Sign in with Google
                    {/* Close button element */}
                </Button>
            // End of non-local conditional block
            )}
            {/* Render Guest/Test Mode login option when running locally */}
            {isLocal && (
                // Mock user guest sign-in button
                // Render button component for Guest Mock authentication
                <Button onClick={signInMockUser} variant="outline" className="gap-2 border-dashed">
                    {/* Login icon visual indicator for test login */}
                    <LogIn className="h-4 w-4" />
                    {/* Label text representing test mode guest authentication */}
                    Sign in as Guest (Test Mode)
                    {/* Close button element */}
                </Button>
            // End of local environment check conditional
            )}
        {/* Close vertical layout wrapper container */}
        </div>
    );
};

// Export the Login component as default
export default Login;
