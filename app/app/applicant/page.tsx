'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApplicantPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/app/applicant/jobs');
    }, [router]);

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
            <div className="text-gray-400">Redirecting to jobs...</div>
        </div>
    );
}
