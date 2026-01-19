'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface SidebarContextType {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    toggleCollapsed: () => void;
    toggleMobile: () => void;
    closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsMobileOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleCollapsed = () => setIsCollapsed(prev => !prev);
    const toggleMobile = () => setIsMobileOpen(prev => !prev);
    const closeMobile = () => setIsMobileOpen(false);

    return (
        <SidebarContext.Provider value={{
            isCollapsed,
            isMobileOpen,
            toggleCollapsed,
            toggleMobile,
            closeMobile,
        }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}
