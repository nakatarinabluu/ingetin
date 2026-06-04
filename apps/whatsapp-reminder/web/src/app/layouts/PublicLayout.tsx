import React from 'react';
import { Navbar } from '@/widgets/navbar/Navbar';
import { Footer } from '@/widgets/navbar/Footer';

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
            {/* Fix [A-01]: Toaster removed here — root App.tsx already has one */}
            {showNavbar && <Navbar />}
            <main className="flex-1 flex flex-col relative z-10 w-full">
                {children}
            </main>
            {showFooter && <Footer />}
        </div>
    );
};
