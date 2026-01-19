'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function EmployerPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const redirectToUserDashboard = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                router.replace(`/app/org/employer/${user.id}`);
            } else {
                router.replace('/auth/login');
            }
        };

        redirectToUserDashboard();
    }, [router]);

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
            <div className="text-gray-400">Redirecting to dashboard...</div>
        </div>
    );
}
