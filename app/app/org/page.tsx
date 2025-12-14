'use client';

import Link from 'next/link';
import { Briefcase, Users } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OrgSetupContent() {
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan');
    const planQuery = plan ? `?plan=${plan}` : '';

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
            <div className="w-full max-w-4xl px-6">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Welcome to SwiftAI Recruit</h1>
                    <p className="text-xl text-[var(--foreground-secondary)]">
                        Choose your role to get started
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Recruiter Option */}
                    <Link href={`/app/app/org/recruiter/setup${planQuery}`} className="card hover:border-[var(--primary-blue)] transition-all p-8 block">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-orange)] flex items-center justify-center mb-6">
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
                    <Link href={`/app/app/org/employer/setup${planQuery}`} className="card hover:border-[var(--primary-blue)] transition-all p-8 block">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--primary-blue)] flex items-center justify-center mb-6">
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

                <p className="text-center text-sm text-[var(--foreground-secondary)] mt-8">
                    Looking for a job?{' '}
                    <Link href={`/app/app/applicant/setup${planQuery}`} className="text-[var(--primary-blue)] hover:underline">
                        Go to Applicant Setup
                    </Link>
                </p>
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