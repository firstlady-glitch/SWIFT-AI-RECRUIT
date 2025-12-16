'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

function RecruiterPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const redirectTarget = searchParams.get('redirectTarget');
                const redirectQuery = redirectTarget ? `?redirectTarget=${redirectTarget}` : '';
                router.replace(`/app/org/recruiter/${user.id}${redirectQuery}`);
            } else {
                router.push('/auth/login');
            }
        };

        checkAuth();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-blue)]"></div>
        </div>
    );
}

export default function RecruiterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <RecruiterPageContent />
        </Suspense>
    );
}
