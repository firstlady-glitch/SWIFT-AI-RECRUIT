'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import { SidebarProvider, useSidebar } from '@/components/dashboard/SidebarContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <main
            className={`
            min-h-screen transition-all duration-300 ease-in-out
            pt-16 md:pt-0
            ${isCollapsed ? 'md:pl-16' : 'md:pl-64'}
        `}
        >
            {children}
        </main>
    );
}

type DashboardRole = 'applicant' | 'employer' | 'recruiter';

export function DashboardRouteLayout({
    role,
    dashboardId,
    children,
}: {
    role: DashboardRole;
    dashboardId: string;
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-[var(--background)]">
                <Sidebar role={role} dashboardId={dashboardId} />
                <DashboardContent>{children}</DashboardContent>
            </div>
        </SidebarProvider>
    );
}
