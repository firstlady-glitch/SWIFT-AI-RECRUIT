'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function DashboardRedirectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();

            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();

                if (authError || !user) {
                    router.push('/auth/login');
                    return;
                }

                // Fetch profile to check role and onboarding status
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role, onboarding_completed')
                    .eq('id', user.id)
                    .single();

                if (profileError || !profile) {
                    // If no profile (shouldn't happen with correct flow), maybe send to register or generic setup?
                    // Assuming 'applicant' default or error handling
                    console.error('Profile not found', profileError);
                    router.push('/auth/login'); // Fallback
                    return;
                }

                const { role, onboarding_completed } = profile;

                // Preserve redirectTarget
                const redirectTarget = searchParams.get('redirectTarget');
                const redirectQuery = redirectTarget ? `?redirectTarget=${redirectTarget}` : '';

                if (!onboarding_completed) {
                    if (role === 'applicant') {
                        router.push(`/app/applicant/setup${redirectQuery}`);
                    } else {
                        // For 'employer', 'recruiter', or initial 'employer' placeholder
                        router.push(`/app/org${redirectQuery}`); // Let them choose or continue setup
                    }
                } else {
                    // Onboarding completed, go to dashboard
                    if (role === 'applicant') {
                        router.push(`/app/applicant/${user.id}${redirectQuery}`);
                    } else if (role === 'recruiter') {
                        router.push(`/app/org/recruiter/${user.id}${redirectQuery}`);
                    } else if (role === 'employer') {
                        router.push(`/app/org/employer/${user.id}${redirectQuery}`);
                    } else {
                        router.push(`/app/org${redirectQuery}`); // Fallback
                    }
                }

            } catch (error) {
                console.error('Redirection error:', error);
                router.push('/auth/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkUser();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)] mx-auto mb-4"></div>
                <p className="text-[var(--foreground-secondary)]">Redirecting...</p>
            </div>
        </div>
    );
}

export default function DashboardRedirect() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <DashboardRedirectContent />
        </Suspense>
    );
}
