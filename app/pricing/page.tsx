'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Check, X } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            <section className="pt-32 pb-20 px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
                <p className="text-xl text-[var(--foreground-secondary)] max-w-2xl mx-auto mb-8">
                    Choose the plan that's right for you. Whether you're a job seeker or a hiring giant, we have you covered.
                </p>

                {/* Toggle (Visual only for now) */}
                <div className="flex items-center justify-center gap-4 mb-16">
                    <span className="font-semibold">Monthly</span>
                    <div className="w-14 h-8 bg-[var(--primary-blue)] rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full"></div>
                    </div>
                    <span className="text-[var(--foreground-secondary)]">Yearly <span className="text-xs text-[var(--success)] font-bold bg-green-50 px-2 py-0.5 rounded-full">-20%</span></span>
                </div>

                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 px-4">
                    {/* Basic */}
                    <div className="card p-8 border border-[var(--border)] hover:border-[var(--primary-blue)] transition-all">
                        <h3 className="text-xl font-bold mb-2">Starter</h3>
                        <p className="text-[var(--foreground-secondary)] text-sm mb-6">For individuals just starting out</p>
                        <div className="text-4xl font-bold mb-6">$15<span className="text-lg text-[var(--foreground-secondary)] font-normal">/mo</span></div>

                        <Link href="/auth?role=applicant&plan=starter" className="btn btn-outline w-full mb-8">Get Started</Link>

                        <ul className="space-y-4 text-left text-sm">
                            <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> 5 AI Resume builds</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Basic job matching</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Application tracking</li>
                            <li className="flex gap-3 text-gray-400"><X className="w-5 h-5" /> Cover Letter Generator</li>
                            <li className="flex gap-3 text-gray-400"><X className="w-5 h-5" /> Priority Support</li>
                        </ul>
                    </div>

                    {/* Pro */}
                    <div className="card p-8 border-2 border-[var(--primary-blue)] relative transform md:-translate-y-4 shadow-xl">
                        <div className="absolute top-0 right-0 left-0 bg-[var(--primary-blue)] text-white text-xs font-bold py-1 rounded-t-lg">MOST POPULAR</div>
                        <h3 className="text-xl font-bold mt-4 mb-2">Professional</h3>
                        <p className="text-[var(--foreground-secondary)] text-sm mb-6">For serious job seekers</p>
                        <div className="text-4xl font-bold mb-6">$30<span className="text-lg text-[var(--foreground-secondary)] font-normal">/mo</span></div>

                        <Link href="/auth?role=applicant&plan=pro" className="btn btn-primary w-full mb-8">Start Free Trial</Link>

                        <ul className="space-y-4 text-left text-sm">
                            <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Unlimited AI Resumes</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Priority job matching</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Cover Letter Generator</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Interview AI Practice</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Email Support</li>
                        </ul>
                    </div>

                    {/* Enterprise */}
                    <div className="card p-8 border border-[var(--border)] hover:border-[var(--primary-blue)] transition-all">
                        <h3 className="text-xl font-bold mb-2">Recruiter / Team</h3>
                        <p className="text-[var(--foreground-secondary)] text-sm mb-6">For agencies and hiring teams</p>
                        <div className="text-4xl font-bold mb-6">$60<span className="text-lg text-[var(--foreground-secondary)] font-normal">/mo</span></div>

                        <Link href="/auth?role=recruiter&plan=team" className="btn btn-outline w-full mb-8">Contact Sales</Link>

                        <ul className="space-y-4 text-left text-sm">
                            <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Everything in Pro</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> 5 Team Members</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> 50 Active Job Posts</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Candidate Ranking AI</li>
                            <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Dedicated Success Manager</li>
                        </ul>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
