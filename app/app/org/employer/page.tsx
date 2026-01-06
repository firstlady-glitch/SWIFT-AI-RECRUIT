'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployerPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/app/org/employer/dashboard');
    }, [router]);

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
            <div className="text-gray-400">Redirecting to dashboard...</div>
        </div>
    );
}
