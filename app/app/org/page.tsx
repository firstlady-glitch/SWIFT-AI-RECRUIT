'use client';

import Link from 'next/link';
import { Briefcase, Users, Check, X, Loader2, Info } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';

/** UI plan cards use friendly keys; billing uses starter / growth / scale for employers. */
function employerStripePlanKey(uiKey: string): string {
    if (uiKey === 'pro') return 'growth';
    if (uiKey === 'team') return 'scale';
    return uiKey;
}

function OrgSetupContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlPlan = searchParams.get('plan');
    const [selectedPlan, setSelectedPlan] = useState(urlPlan || 'free');
    const [acceptPayments, setAcceptPayments] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [billingHint, setBillingHint] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                setAcceptPayments(data.acceptPayments);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    // Construct the query string properly
    const getLink = (basePath: string) => {
        const params = new URLSearchParams();
        if (selectedPlan) params.set('plan', selectedPlan);

        const redirectTarget = searchParams.get('redirectTarget');
        if (redirectTarget) params.set('redirectTarget', redirectTarget);

        return `${basePath}?${params.toString()}`;
    };

    const handlePlanSelect = async (planKey: string) => {
        if (planKey === 'free') {
            setSelectedPlan(planKey);
            return;
        }

        if (!acceptPayments) {
            setBillingHint(
                'Paid subscriptions are turned off in admin settings. You can still onboard on the Free tier.'
            );
            setSelectedPlan('free');
            return;
        }

        setBillingHint(null);
        setSelectedPlan(planKey);
        const billingKey = employerStripePlanKey(planKey);
        try {
            const res = await fetch('/api/paystack/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planKey: billingKey,
                    interval: 'monthly',
                    role: 'employer',
                }),
            });
            const data = await res.json();
            const payUrl = data.authorization_url || data.url;
            if (payUrl) {
                window.location.href = payUrl;
                return;
            }
            if (data.error) {
                setBillingHint(data.error);
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setBillingHint('Could not start checkout. Try again or contact support.');
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] pb-20">
            <div className="w-full max-w-6xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Welcome to SwiftAI Recruit</h1>
                    <p className="text-xl text-[var(--foreground-secondary)]">
                        Choose your role to get started
                    </p>
                </div>

                {/* Role Selection */}
                <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-4xl mx-auto">
                    {/* Recruiter Option */}
                    <Link href={getLink('/app/org/recruiter/setup')} className="card hover:border-[var(--primary-blue)] transition-all p-8 block group">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-orange)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">I'm a Recruiter</h2>
                        <p className="text-[var(--foreground-secondary)] mb-4">
                            Source top talent, manage candidate pipelines, and submit candidates to client jobs.
                        </p>
                        <ul className="space-y-2 text-sm text-[var(--foreground-secondary)]">
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--success)] mt-1">✓</span>
                                <span>Real-time team collaboration</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--success)] mt-1">✓</span>
                                <span>Data-driven hiring insights</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--success)] mt-1">✓</span>
                                <span>Centralized feedback workflows</span>
                            </li>
                        </ul>
                    </Link>

                    {/* Employer Option */}
                    <Link href={getLink('/app/org/employer/setup')} className="card hover:border-[var(--primary-blue)] transition-all p-8 block group">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--primary-blue)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Briefcase className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">I'm an Employer</h2>
                        <p className="text-[var(--foreground-secondary)] mb-4">
                            Post jobs, review AI-ranked candidates, and hire the best talent for your organization.
                        </p>
                        <ul className="space-y-2 text-sm text-[var(--foreground-secondary)]">
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--success)] mt-1">✓</span>
                                <span>Structured & fair hiring practices</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--success)] mt-1">✓</span>
                                <span>Multi-channel job distribution</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--success)] mt-1">✓</span>
                                <span>Pipeline analytics & insights</span>
                            </li>
                        </ul>
                    </Link>
                </div>

                {/* Plan Selection */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Select a Plan</h2>
                    <p className="text-[var(--foreground-secondary)]">
                        {acceptPayments
                            ? 'Choose the plan that fits your needs. Checkout runs securely through Paystack.'
                            : 'Billing is disabled — new organizations start on Free until an admin enables payments.'}
                    </p>
                </div>

                {billingHint && (
                    <div className="max-w-3xl mx-auto mb-8 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-[var(--foreground)]">
                        <Info className="w-5 h-5 shrink-0 text-amber-600" />
                        <p>{billingHint}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-4 gap-6">
                        {/* Free Plan */}
                        <div
                            onClick={() => handlePlanSelect('free')}
                            className={`card p-6 border cursor-pointer transition-all ${selectedPlan === 'free' ? 'border-[var(--primary-blue)] ring-2 ring-[var(--primary-blue)]/20' : 'border-[var(--border)] hover:border-[var(--primary-blue)]'}`}
                        >
                            <h3 className="text-xl font-bold mb-2">Free</h3>
                            <p className="text-[var(--foreground-secondary)] text-sm mb-4">Get started for free</p>
                            <div className="text-3xl font-bold mb-6">$0<span className="text-base text-[var(--foreground-secondary)] font-normal">/mo</span></div>

                            <ul className="space-y-3 text-left text-sm">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> 1 Active Job Post</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> Basic AI Matching</li>
                                <li className="flex gap-2 text-gray-400"><X className="w-4 h-4" /> Team Collaboration</li>
                            </ul>
                        </div>

                        {/* Starter Plan */}
                        <div
                            onClick={() => handlePlanSelect('starter')}
                            className={`card p-6 border relative overflow-hidden transition-all ${acceptPayments
                                ? `cursor-pointer ${selectedPlan === 'starter' ? 'border-[var(--primary-blue)] ring-2 ring-[var(--primary-blue)]/20' : 'border-[var(--border)] hover:border-[var(--primary-blue)]'}`
                                : 'opacity-90 cursor-pointer border-[var(--border)] hover:border-amber-500/40'
                                }`}
                        >
                            {!acceptPayments && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mb-2 font-medium">
                                    Needs billing enabled
                                </p>
                            )}
                            <h3 className="text-xl font-bold mb-2">Starter</h3>
                            <p className="text-[var(--foreground-secondary)] text-sm mb-4">For growing teams</p>
                            <div className="text-3xl font-bold mb-6">$15<span className="text-base text-[var(--foreground-secondary)] font-normal">/mo</span></div>

                            <ul className="space-y-3 text-left text-sm">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> 5 Active Job Posts</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> 50 AI Resume Screens</li>
                                <li className="flex gap-2 text-gray-400"><X className="w-4 h-4" /> Team Collaboration</li>
                            </ul>
                        </div>

                        {/* Professional Plan */}
                        <div
                            onClick={() => handlePlanSelect('pro')}
                            className={`card p-6 border-2 relative overflow-hidden transition-all ${acceptPayments
                                ? `cursor-pointer ${selectedPlan === 'pro' ? 'border-[var(--primary-blue)] ring-2 ring-[var(--primary-blue)]/20' : 'border-[var(--primary-blue)]/30 hover:border-[var(--primary-blue)]'}`
                                : 'opacity-90 cursor-pointer border-[var(--primary-blue)]/30 hover:border-amber-500/40'
                                }`}
                        >
                            <div className="absolute top-0 right-0 left-0 bg-[var(--primary-blue)]/50 text-white text-xs font-bold py-1 rounded-t-lg text-center">MOST POPULAR</div>
                            {!acceptPayments && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mb-2 mt-6 font-medium relative z-10">
                                    Needs billing enabled
                                </p>
                            )}
                            <h3 className="text-xl font-bold mb-2 mt-2">Professional</h3>
                            <p className="text-[var(--foreground-secondary)] text-sm mb-4">For active hiring</p>
                            <div className="text-3xl font-bold mb-6">$30<span className="text-base text-[var(--foreground-secondary)] font-normal">/mo</span></div>

                            <ul className="space-y-3 text-left text-sm">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> 15 Active Job Posts</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> Unlimited AI Screens</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> Priority Support</li>
                            </ul>
                        </div>

                        {/* Team Plan */}
                        <div
                            onClick={() => handlePlanSelect('team')}
                            className={`card p-6 border relative overflow-hidden transition-all ${acceptPayments
                                ? `cursor-pointer ${selectedPlan === 'team' ? 'border-[var(--primary-blue)] ring-2 ring-[var(--primary-blue)]/20' : 'border-[var(--border)] hover:border-[var(--primary-blue)]'}`
                                : 'opacity-90 cursor-pointer border-[var(--border)] hover:border-amber-500/40'
                                }`}
                        >
                            {!acceptPayments && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mb-2 font-medium">
                                    Needs billing enabled
                                </p>
                            )}
                            <h3 className="text-xl font-bold mb-2">Team</h3>
                            <p className="text-[var(--foreground-secondary)] text-sm mb-4">For agencies</p>
                            <div className="text-3xl font-bold mb-6">$60<span className="text-base text-[var(--foreground-secondary)] font-normal">/mo</span></div>

                            <ul className="space-y-3 text-left text-sm">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> 50 Active Job Posts</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> 5 Team Members</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> Dedicated Support</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function OrgSetupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <OrgSetupContent />
        </Suspense>
    );
}
