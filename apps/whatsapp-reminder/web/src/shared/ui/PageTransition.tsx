import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
    children: React.ReactNode;
}

/**
 * 🟢 WHATSAPP MODERN PRO - PAGE TRANSITION
 * Fast, subtle fade for professional feel.
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
                duration: 0.3, 
                ease: "easeInOut" 
            }}
            className="w-full flex-1 flex flex-col"
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
