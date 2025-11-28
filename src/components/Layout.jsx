import React from 'react';
import Login from './Login';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 max-w-screen-2xl items-center px-4">
                    <div className="mr-4 flex">
                        <a className="mr-6 flex items-center space-x-2" href="/">
                            <span className="hidden font-bold sm:inline-block">
                                Medicine Tracker
                            </span>
                        </a>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <Login />
                    </div>
                </div>
            </header>
            <main className="container max-w-screen-2xl p-4 md:p-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
