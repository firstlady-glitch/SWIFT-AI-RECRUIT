'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const role = searchParams.get('role') || 'applicant';
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const supabase = createClient();

            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });

            if (signInError) throw signInError;

            // Get user profile to check onboarding status
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, onboarding_completed, organization_id')
                .eq('id', data.user.id)
                .single();

            // Redirect based on profile
            if (!profile || !profile.onboarding_completed) {
                if (profile?.role === 'applicant') {
                    router.push('/app/app/applicant/setup');
                } else {
                    router.push('/app/app/org');
                }
            } else {
                if (profile.role === 'applicant') {
                    router.push(`/app/app/applicant/${data.user.id}`);
                } else if (profile.role === 'recruiter') {
                    router.push(`/app/app/org/recruiter/${data.user.id}`);
                } else if (profile.role === 'employer') {
                    router.push(`/app/app/org/employer/${data.user.id}`);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
            <div className="w-full max-w-md px-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to home
                </Link>

                <div className="card p-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-[var(--foreground-secondary)] mb-8">
                        Sign in to your SwiftAI Recruit account
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-medium">
                                    Password
                                </label>
                                <Link href="/auth/forgot-password" className="text-sm text-[var(--primary-blue)] hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                type="password"
                                id="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn btn-primary py-3"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-sm text-[var(--foreground-secondary)] text-center mt-6">
                        Don't have an account?{' '}
                        <Link href={`/auth/register?role=${role}`} className="text-[var(--primary-blue)] hover:underline font-semibold">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
