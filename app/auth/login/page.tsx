'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Checkbox } from '@/components/ui/Checkbox';

function LoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    // Don't default to 'applicant' immediately for the link generation
    const roleParam = searchParams.get('role');
    const role = roleParam || 'applicant'; // Default for internal logic if needed, or keeping it null might be better? 
    // Actually, looking at the code, 'role' is only used for the Sign Up link. 
    // If I want the Sign Up link to be clean, I should use roleParam.

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            const redirectTarget = searchParams.get('redirectTarget');
            const redirectQuery = redirectTarget ? `?redirectTarget=${redirectTarget}` : '';
            const redirectQueryAmp = redirectTarget ? `&redirectTarget=${redirectTarget}` : '';

            if (!profile || !profile.onboarding_completed) {
                // If role is unknown/missing in profile (shouldn't happen if reg flow is good), default to org selection or applicant setup?
                // Safest to check role.
                if (profile?.role === 'applicant') {
                    router.push(`/app/applicant/setup${redirectQuery}`);
                } else {
                    // Falls through for 'employer', 'recruiter', or invalid
                    router.push(`/app/org${redirectQuery}`);
                }
            } else {
                if (profile.role === 'applicant') {
                    router.push(`/app/applicant/${data.user.id}${redirectQuery}`);
                } else if (profile.role === 'recruiter') {
                    router.push(`/app/org/recruiter/${data.user.id}${redirectQuery}`);
                } else if (profile.role === 'employer') {
                    router.push(`/app/org/employer/${data.user.id}${redirectQuery}`);
                } else {
                    // Fallback for admin or weird states
                    router.push(`/app${redirectQuery}`);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0b0c0f] text-gray-100 p-4">
            <div className="w-full max-w-lg">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to home
                </Link>

                <div className="bg-[#15171e] border border-gray-800 rounded-2xl p-8 md:p-10 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2 text-white">Welcome Back</h1>
                        <p className="text-gray-400">
                            Sign in to your SwiftAI Recruit account
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-300">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-800 bg-[#0b0c0f] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                    Password
                                </label>
                                <Link href="/auth/forgot-password" className="text-sm text-[var(--primary-blue)] hover:text-blue-400 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-800 bg-[#0b0c0f] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <Checkbox
                                id="showPassword"
                                checked={showPassword}
                                onChange={setShowPassword}
                                label="Show Password"
                                className="mt-2"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn btn-primary py-3.5 text-lg shadow-lg shadow-blue-900/20"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-sm text-gray-500 text-center mt-8">
                        Don't have an account?{' '}
                        <Link
                            href={roleParam ? `/auth/register?role=${roleParam}` : '/auth/register'}
                            className="text-[var(--primary-blue)] hover:text-blue-400 hover:underline font-semibold"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div >
        </div >
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
