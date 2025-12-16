'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import { useParams } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    // In a real app we might validate the param matches the auth user here or middleware

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Sidebar role="applicant" dashboardId={params.dashboard as string} />
            <main className="pl-64 min-h-screen">
                {children}
            </main>
        </div>
    );
}
