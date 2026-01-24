'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, EyeOff, UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function AdminLoginContent() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false); // TOGGLE: Comment this line and set to false to disable signup
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const supabase = createClient();

            if (isSignUp) {
                // SIGNUP MODE
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName
                        }
                    }
                });

                if (signUpError) throw signUpError;

                if (data.user) {
                    // Create admin profile
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: data.user.id,
                            email: formData.email,
                            full_name: formData.fullName,
                            role: 'admin',
                            onboarding_completed: true
                        });

                    if (profileError) throw profileError;

                    setSuccess('Admin account created! You can now sign in.');
                    setIsSignUp(false);
                    setFormData({ ...formData, password: '' });
                }
            } else {
                // LOGIN MODE
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });

                if (signInError) throw signInError;

                // Verify user is an admin
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                if (profileError) throw profileError;

                if (profile?.role !== 'admin') {
                    await supabase.auth.signOut();
                    throw new Error('Access denied. This login is for administrators only.');
                }

                router.push('/admin');
            }
        } catch (err: any) {
            setError(err.message || (isSignUp ? 'Registration failed' : 'Login failed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
            <div className="w-full max-w-lg">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to home
                </Link>

                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-2xl p-8 md:p-10 shadow-2xl">
                    {/* Admin Badge */}
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
                            {isSignUp ? (
                                <UserPlus className="w-10 h-10 text-red-500" />
                            ) : (
                                <Shield className="w-10 h-10 text-red-500" />
                            )}
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">
                            {isSignUp ? 'Create Admin Account' : 'Admin Access'}
                        </h1>
                        <p className="text-[var(--foreground-secondary)]">
                            {isSignUp ? 'Register a new administrator' : 'Sign in to the SwiftAI Control Center'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Full Name - Only for signup */}
                        {isSignUp && (
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    required={isSignUp}
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                Admin Email
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
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                Password
                            </label>
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
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[var(--foreground)] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 text-lg font-semibold rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {isSignUp ? 'Creating...' : 'Verifying...'}
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    {isSignUp ? <UserPlus className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                                    {isSignUp ? 'Create Admin Account' : 'Sign In to Admin'}
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Toggle between Login/Signup - COMMENT OUT THIS BLOCK TO DISABLE SIGNUP */}
                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                                setSuccess('');
                            }}
                            className="text-sm text-red-400 hover:text-red-300 hover:underline"
                        >
                            {isSignUp ? 'Already have an admin account? Sign in' : 'Need to create an admin account? Sign up'}
                        </button>
                    </div>
                    {/* END SIGNUP TOGGLE BLOCK */}

                    <div className="mt-8 pt-6 border-t border-[var(--border)]">
                        <p className="text-xs text-center text-[var(--foreground-secondary)]">
                            This is a restricted area. Unauthorized access attempts are logged.
                        </p>
                    </div>
                </div>

                <p className="text-sm text-[var(--foreground-secondary)] text-center mt-6">
                    Not an admin?{' '}
                    <Link
                        href="/auth/login"
                        className="text-[var(--primary-blue)] hover:text-blue-400 hover:underline font-semibold"
                    >
                        Go to regular login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent" />
            </div>
        }>
            <AdminLoginContent />
        </Suspense>
    );
}
