'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function RecruiterDashboardContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const redirectTarget = searchParams.get('redirectTarget');
        if (redirectTarget === 'tools') {
            router.push(`/app/org/recruiter/${params.dashboard}/tools`);
        }
    }, [searchParams, params.dashboard, router]);

    return (
        <div className="min-h-screen bg-[var(--background)] px-4">
            <div className="section py-12">
                <h1 className="text-4xl font-bold mb-6">Recruiter Dashboard</h1>
                <p className="text-xl text-[var(--foreground-secondary)] mb-8">
                    Manage your talent pipeline and placements
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="card p-6">
                        <h3 className="text-xl font-bold mb-2">Candidates</h3>
                        <p className="text-[var(--foreground-secondary)]">
                            Browse and manage your talent pool
                        </p>
                    </div>

                    <div className="card p-6">
                        <h3 className="text-xl font-bold mb-2">Client Jobs</h3>
                        <p className="text-[var(--foreground-secondary)]">
                            View and submit to client positions
                        </p>
                    </div>

                    <div className="card p-6">
                        <h3 className="text-xl font-bold mb-2">Placements</h3>
                        <p className="text-[var(--foreground-secondary)]">
                            Track your successful placements
                        </p>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-[var(--background-secondary)] rounded-lg text-sm text-[var(--foreground-secondary)]">
                    Dashboard ID: {params.dashboard}
                </div>
            </div>
        </div>
    );
}

export default function RecruiterDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <RecruiterDashboardContent />
        </Suspense>
    );
}
