import React from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/context/StoreContext';

const Login = () => {
    const { user, signInWithGoogle, logout } = useStore();

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <div className="text-sm text-right hidden sm:block">
                    <p className="font-medium">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        );
    }

    return (
        <Button onClick={signInWithGoogle} className="gap-2">
            <LogIn className="h-4 w-4" />
            Sign in with Google
        </Button>
    );
};

export default Login;
