'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Checkbox } from '@/components/ui/Checkbox';

function RegisterContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    // State to toggle password visibility
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam === 'applicant' || roleParam === 'org') {
            setRole(roleParam);
        }
    }, [searchParams]);

    const handleRoleSelect = (selectedRole: string) => {
        setRole(selectedRole);
        // Update URL without navigation to keep state in sync
        const url = new URL(window.location.href);
        url.searchParams.set('role', selectedRole);
        window.history.pushState({}, '', url.toString());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const supabase = createClient();

            // 1. Sign up with Supabase Auth
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: role
                    }
                }
            });

            if (signUpError) throw signUpError;
            if (!authData.user) throw new Error('No user created');

            // 2. Create Profile in public.profiles
            // Note: For 'org' role, we insert 'employer' as a placeholder. 
            // The specific sub-role (recruiter/employer) is handled in the setup page.
            const dbRole = role === 'org' ? 'employer' : 'applicant';

            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    email: formData.email,
                    full_name: formData.fullName,
                    role: dbRole,
                    onboarding_completed: false
                });

            if (profileError) {
                // Determine if we should rollback auth user creation? 
                // For now, let's just throw and show error. User exists in Auth but not Profile.
                // In production, might want a robust rollback or idempotent retry.
                throw profileError;
            }

            // 3. Redirect based on role
            const plan = searchParams.get('plan');
            const redirectTarget = searchParams.get('redirectTarget');

            const params = new URLSearchParams();
            if (plan) params.set('plan', plan);
            else if (role !== 'org') params.set('plan', 'free'); // Default for applicant, org flows might differ

            if (redirectTarget) params.set('redirectTarget', redirectTarget);

            const queryString = params.toString() ? `?${params.toString()}` : '';

            if (role === 'applicant') {
                router.push(`/app/applicant/setup${queryString}`);
            } else {
                router.push(`/app/org${queryString}`);
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Registration failed');
            setIsLoading(false);
        }
    };

    if (!role) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] py-12 px-4">
                <div className="w-full max-w-5xl">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to home
                    </Link>

                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Join SwiftAI Recruit</h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Choose how you want to use the platform. Connecting top talent with world-class organizations.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <button
                            onClick={() => handleRoleSelect('applicant')}
                            className="group relative bg-[var(--background-secondary)] border border-[var(--border)] hover:border-[var(--primary-blue)] hover:shadow-2xl hover:shadow-blue-900/20 p-10 rounded-3xl transition-all text-left flex flex-col items-center text-center overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-blue)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="w-20 h-20 rounded-2xl bg-[var(--primary-blue)]/10 text-[var(--primary-blue)] flex items-center justify-center mb-8 group-hover:bg-[var(--primary-blue)] group-hover:text-white transition-colors relative z-10">
                                <User className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3 text-[var(--foreground)] relative z-10">I'm a Job Seeker</h2>
                            <p className="text-[var(--foreground-secondary)] relative z-10">
                                Find your dream job, track applications, and get AI-powered career advice.
                            </p>
                        </button>

                        <button
                            onClick={() => handleRoleSelect('org')}
                            className="group relative bg-[var(--background-secondary)] border border-[var(--border)] hover:border-[var(--accent-orange)] hover:shadow-2xl hover:shadow-orange-900/20 p-10 rounded-3xl transition-all text-left flex flex-col items-center text-center overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-orange)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="w-20 h-20 rounded-2xl bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] flex items-center justify-center mb-8 group-hover:bg-[var(--accent-orange)] group-hover:text-white transition-colors relative z-10">
                                <Briefcase className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3 text-[var(--foreground)] relative z-10">I'm Hiring</h2>
                            <p className="text-[var(--foreground-secondary)] relative z-10">
                                Post jobs, discover ranked candidates, and streamline your entire hiring process.
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] py-12 px-4">
            <div className="w-full max-w-2xl">
                <button
                    onClick={() => setRole(null)}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to selection
                </button>

                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-2xl p-8 md:p-12 shadow-2xl">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">Create Account</h1>
                        <p className="text-gray-400">
                            {role === 'applicant' ? 'Start your intelligent job search today' : 'Transform how you hire talent'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label htmlFor="fullName" className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        id="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label htmlFor="email" className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        required
                                        minLength={6}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent transition-all"
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

                        </div>

                        <p className="text-sm text-gray-400 text-center mt-4">
                            By signing up, you consent to SwiftAI Recruit's{' '}
                            <Link href="/app/terms" className="text-[var(--primary-blue)] hover:text-blue-400 hover:underline">
                                Terms of Use
                            </Link>
                            {' '}and{' '}
                            <Link href="/app/privacy" className="text-[var(--primary-blue)] hover:text-blue-400 hover:underline">
                                Privacy Policy
                            </Link>.
                        </p>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn btn-primary py-4 text-lg shadow-lg shadow-blue-900/20"
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-sm text-gray-500 text-center mt-8">
                        Already have an account?{' '}
                        <Link href={`/auth/login?role=${role}`} className="text-[var(--primary-blue)] hover:text-blue-400 hover:underline font-semibold">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div >
        </div >
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <RegisterContent />
        </Suspense>
    );
}


// we will be adding a 2 role select mode for applicant or org, it should show first if one visits the register page without a url parameter before displaying the form to register