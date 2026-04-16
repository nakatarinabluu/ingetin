import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Toaster } from '../components/ui/Toaster';

interface PublicLayoutProps {
    children: React.ReactNode;
    showNavbar?: boolean;
    showFooter?: boolean;
}

/**
 * 💡 THE MODERN SAAS PUBLIC LAYOUT
 */
export const PublicLayout = ({ 
    children, 
    showNavbar = true, 
    showFooter = true 
}: PublicLayoutProps) => {
    return (
        <div className="min-h-screen bg-[#f0f2f5] relative flex flex-col font-body text-left overflow-x-hidden">
            <Toaster />
            {showNavbar && <Navbar />}
            <main className="flex-1 flex flex-col relative z-10 w-full">
                {children}
            </main>
            {showFooter && <Footer />}
        </div>
    );
};
