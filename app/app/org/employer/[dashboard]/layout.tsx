'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import { useParams } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Sidebar role="employer" dashboardId={params.dashboard as string} />
            <main className="pl-64 min-h-screen">
                {children}
            </main>
        </div>
    );
}
