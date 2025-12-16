'use client';

import Link from 'next/link';
import { Briefcase, Users, Check, X, Lock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function OrgSetupContent() {
    const searchParams = useSearchParams();
    const urlPlan = searchParams.get('plan');
    const [selectedPlan, setSelectedPlan] = useState(urlPlan || 'free');

    // Construct the query string properly
    const getLink = (basePath: string) => {
        const params = new URLSearchParams();
        if (selectedPlan) params.set('plan', selectedPlan);

        const redirectTarget = searchParams.get('redirectTarget');
        if (redirectTarget) params.set('redirectTarget', redirectTarget);

        return `${basePath}?${params.toString()}`;
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
                                <span>Access global talent database</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--success)] mt-1">✓</span>
                                <span>AI-powered candidate matching</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--success)] mt-1">✓</span>
                                <span>Track placements and commissions</span>
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
                                <span>Post unlimited job listings</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--success)] mt-1">✓</span>
                                <span>AI-generated job descriptions</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--success)] mt-1">✓</span>
                                <span>Collaborate with your hiring team</span>
                            </li>
                        </ul>
                    </Link>
                </div>

                {/* Plan Selection */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Select a Plan</h2>
                    <p className="text-[var(--foreground-secondary)]">
                        Choose the plan that fits your needs
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                    {/* Free Plan */}
                    <div
                        onClick={() => setSelectedPlan('free')}
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

                    {/* Starter - Coming Soon */}
                    <div
                        // onClick={() => setSelectedPlan('starter')} 
                        className={`card p-6 border relative overflow-hidden opacity-75 cursor-not-allowed group border-[var(--border)]`}
                    >
                        <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                            <Lock className="w-8 h-8 text-white mb-2" />
                            <span className="text-white font-bold text-sm">Coming Soon</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Starter</h3>
                        <p className="text-[var(--foreground-secondary)] text-sm mb-4">For growing starts</p>
                        <div className="text-3xl font-bold mb-6">$15<span className="text-base text-[var(--foreground-secondary)] font-normal">/mo</span></div>

                        <ul className="space-y-3 text-left text-sm">
                            <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> 5 Active Job Posts</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> 50 AI Resume Screens</li>
                            <li className="flex gap-2 text-gray-400"><X className="w-4 h-4" /> Team Collaboration</li>
                        </ul>
                    </div>

                    {/* Professional - Coming Soon */}
                    <div
                        // onClick={() => setSelectedPlan('pro')}
                        className={`card p-6 border-2 relative overflow-hidden opacity-75 cursor-not-allowed group border-[var(--primary-blue)]/30`}
                    >
                        <div className="absolute top-0 right-0 left-0 bg-[var(--primary-blue)]/50 text-white text-xs font-bold py-1 rounded-t-lg text-center">MOST POPULAR</div>
                        <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                            <Lock className="w-8 h-8 text-white mb-2" />
                            <span className="text-white font-bold text-sm">Coming Soon</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 mt-2">Professional</h3>
                        <p className="text-[var(--foreground-secondary)] text-sm mb-4">For active hiring</p>
                        <div className="text-3xl font-bold mb-6">$30<span className="text-base text-[var(--foreground-secondary)] font-normal">/mo</span></div>

                        <ul className="space-y-3 text-left text-sm">
                            <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> 15 Active Job Posts</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> Unlimited AI Screens</li>
                            <li className="flex gap-2"><Check className="w-4 h-4 text-[var(--success)]" /> Priority Support</li>
                        </ul>
                    </div>

                    {/* Team - Coming Soon */}
                    <div
                        // onClick={() => setSelectedPlan('team')}
                        className={`card p-6 border relative overflow-hidden opacity-75 cursor-not-allowed group border-[var(--border)]`}
                    >
                        <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                            <Lock className="w-8 h-8 text-white mb-2" />
                            <span className="text-white font-bold text-sm">Coming Soon</span>
                        </div>
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
