'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import { SidebarProvider, useSidebar } from '@/components/dashboard/SidebarContext';
import { useParams } from 'next/navigation';

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <main className={`
            min-h-screen transition-all duration-300 ease-in-out
            pt-16 md:pt-0
            ${isCollapsed ? 'md:pl-16' : 'md:pl-64'}
        `}>
            {children}
        </main>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    // In a real app we might validate the param matches the auth user here or middleware

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-[var(--background)]">
                <Sidebar role="applicant" dashboardId={params.dashboard as string} />
                <DashboardContent>{children}</DashboardContent>
            </div>
        </SidebarProvider>
    );
}
