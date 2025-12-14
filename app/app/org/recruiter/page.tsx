'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function RecruiterPage() {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                router.replace(`/app/app/org/recruiter/${user.id}`);
            } else {
                router.push('/auth/login');
            }
        };

        checkAuth();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-blue)]"></div>
        </div>
    );
}
