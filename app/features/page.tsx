'use client';

import { useState } from 'react';
import { Check, ArrowRight, Briefcase, Search, FileText, UserCheck, Calendar, BarChart, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Image from 'next/image';

export default function FeaturesPage() {
    const [activeTab, setActiveTab] = useState<'applicant' | 'employer'>('applicant');

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />
            {/* Header */}
            <div className="bg-[var(--background-secondary)] text-white pt-32 pb-16 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-15">
                    <Image
                        src="/features.png"
                        alt="Features Background"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Powerful Features for Everyone</h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                        Whether you're hiring or hunting, we have the tools you need to succeed.
                    </p>

                    {/* Tabs */}
                    <div className="inline-flex gap-2 bg-white/10 p-1 rounded-xl backdrop-blur-sm border border-white/20">
                        <button
                            onClick={() => setActiveTab('applicant')}
                            className={`px-7 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'applicant'
                                ? 'bg-white text-[var(--primary-blue)] shadow-lg'
                                : 'bg-[#1f1f1f] text-gray-200 hover:bg-[#2a2a2a]'
                                }`}

                        >
                            Job Seekers
                        </button>
                        <button
                            onClick={() => setActiveTab('employer')}
                            className={`px-7 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'employer'
                                ? 'bg-[var(--accent-orange)] text-white shadow-lg'
                                : 'bg-[#1f1f1f] text-gray-200 hover:bg-[#2a2a2a]'
                                }`}

                        >
                            Employers & Recruiters
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16">
                {activeTab === 'applicant' ? <ApplicantContent /> : <EmployerContent />}
            </div>
        </div>
    );
}

function ApplicantContent() {
    const [showPricing, setShowPricing] = useState(false);

    const features = [
        {
            icon: <Search className="w-8 h-8 text-[var(--primary-blue)]" />,
            title: "Smart Job Search",
            description: "Find the perfect role with AI-powered matching algorithms that understand your true potential."
        },
        {
            icon: <FileText className="w-8 h-8 text-[var(--primary-blue)]" />,
            title: "AI Resume Builder",
            description: "Create ATS-friendly resumes in minutes with our intelligent suggestions and formatting tools."
        },
        {
            icon: <Zap className="w-8 h-8 text-[var(--primary-blue)]" />,
            title: "Smart Recommendations",
            description: "Get personalized job alerts based on your skills, experience, and career goals."
        },
        {
            icon: <BarChart className="w-8 h-8 text-[var(--primary-blue)]" />,
            title: "Application Tracking",
            description: "Keep track of all your applications in one organized dashboard with real-time status updates."
        }
    ];

    return (
        <div className="space-y-16">
            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, idx) => (
                    <div key={idx} className="card p-6 hover:border-[var(--primary-blue)] transition-all group">
                        <div className="mb-4 bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                        <p className="text-[var(--foreground-secondary)]">{feature.description}</p>
                    </div>
                ))}
            </div>

            {/* Pricing Section */}
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-[var(--foreground-secondary)]">Start for free, upgrade for power.</p>
                </div>

                {!showPricing ? (
                    <div className="card max-w-md mx-auto p-8 text-center border-2 border-[var(--primary-blue)] bg-blue-50/50">
                        <h3 className="text-sm font-bold text-[var(--primary-blue)] uppercase tracking-wider mb-2">Basic Plan</h3>
                        <div className="text-5xl font-bold mb-2">$15<span className="text-lg text-[var(--foreground-secondary)] font-medium">/mo</span></div>
                        <p className="text-[var(--foreground-secondary)] mb-6">Perfect for active job seekers</p>
                        <button
                            onClick={() => setShowPricing(true)}
                            className="btn btn-primary w-full mb-4"
                        >
                            View All Plans
                        </button>
                        <p className="text-xs text-[var(--foreground-secondary)]">Includes AI Resume Builder & Tracking</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        {/* Tier 1 */}
                        <div className="card p-8 border border-[var(--border)] hover:border-[var(--primary-blue)] transition-all">
                            <h3 className="text-xl font-bold mb-2">Starter</h3>
                            <div className="text-4xl font-bold mb-4">$15<span className="text-sm text-[var(--foreground-secondary)]">/mo</span></div>
                            <ul className="space-y-3 mb-8 text-[var(--foreground-secondary)] text-sm">
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> 5 AI Resume builds</li>
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> Basic job matching</li>
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> Application tracking</li>
                            </ul>
                            <button disabled className="btn w-full bg-gray-100 text-gray-400 cursor-not-allowed">Coming Soon</button>
                        </div>

                        {/* Tier 2 */}
                        <div className="card p-8 border-2 border-[var(--primary-blue)] relative transform md:-translate-y-4 shadow-xl">
                            <div className="absolute top-0 right-0 bg-[var(--primary-blue)] text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>
                            <h3 className="text-xl font-bold mb-2">Pro</h3>
                            <div className="text-4xl font-bold mb-4">$30<span className="text-sm text-[var(--foreground-secondary)]">/mo</span></div>
                            <ul className="space-y-3 mb-8 text-[var(--foreground-secondary)] text-sm">
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> Unlimited AI Resumes</li>
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> Priority job matching</li>
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> Featured profile badge</li>
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> Cover letter generator</li>
                            </ul>
                            <button disabled className="btn btn-primary w-full opacity-15 cursor-not-allowed">Coming Soon</button>
                        </div>

                        {/* Tier 3 */}
                        <div className="card p-8 border border-[var(--border)] hover:border-[var(--primary-blue)] transition-all">
                            <h3 className="text-xl font-bold mb-2">Career+</h3>
                            <div className="text-4xl font-bold mb-4">$45<span className="text-sm text-[var(--foreground-secondary)]">/mo</span></div>
                            <ul className="space-y-3 mb-8 text-[var(--foreground-secondary)] text-sm">
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> Everything in Pro</li>
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> 1-on-1 Career Coaching</li>
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> Salary negotiation help</li>
                            </ul>
                            <button disabled className="btn w-full bg-gray-100 text-gray-400 cursor-not-allowed">Coming Soon</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function EmployerContent() {
    const [showPricing, setShowPricing] = useState(false);

    const features = [
        {
            icon: <Briefcase className="w-8 h-8 text-[var(--accent-orange)]" />,
            title: "Post Unlimited Jobs",
            description: "Reach millions of qualified candidates with our multi-channel distribution network."
        },
        {
            icon: <UserCheck className="w-8 h-8 text-[var(--accent-orange)]" />,
            title: "AI Candidate Matching",
            description: "Our AI automatically ranks applicants by relevance, saving you hours of screening time."
        },
        {
            icon: <Calendar className="w-8 h-8 text-[var(--accent-orange)]" />,
            title: "Interview Scheduling",
            description: "Automated scheduling tools that sync with your calendar to book interviews seamlessly."
        },
        {
            icon: <Users className="w-8 h-8 text-[var(--accent-orange)]" />,
            title: "Pipeline Management",
            description: "Visual kanban boards to track candidates from application to offer letter."
        }
    ];

    return (
        <div className="space-y-16">
            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, idx) => (
                    <div key={idx} className="card p-6 hover:border-[var(--accent-orange)] transition-all group">
                        <div className="mb-4 bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                        <p className="text-[var(--foreground-secondary)]">{feature.description}</p>
                    </div>
                ))}
            </div>

            {/* Pricing Section */}
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Agencies & Employers</h2>
                    <p className="text-[var(--foreground-secondary)]">Scale your hiring without scaling your budget.</p>
                </div>

                {!showPricing ? (
                    <div className="card max-w-md mx-auto p-8 text-center border-2 border-[var(--accent-orange)] bg-orange-50/50">
                        <h3 className="text-sm font-bold text-[var(--accent-orange)] uppercase tracking-wider mb-2">Growth Plan</h3>
                        <div className="text-5xl font-bold mb-2">$30<span className="text-lg text-[var(--foreground-secondary)] font-medium">/mo</span></div>
                        <p className="text-[var(--foreground-secondary)] mb-6">Essential tools for growing teams</p>
                        <button
                            onClick={() => setShowPricing(true)}
                            className="btn bg-[var(--accent-orange)] text-white hover:bg-[#e05e2b] px-6 py-3 rounded-lg font-semibold w-full mb-4 shadow-lg hover:shadow-xl transition-all"
                        >
                            View Full Price Grid
                        </button>
                        <p className="text-xs text-[var(--foreground-secondary)]">Includes 3 Active Jobs & AI Matching</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        {/* Tier 1 */}
                        <div className="card p-8 border border-[var(--border)] hover:border-[var(--accent-orange)] transition-all">
                            <h3 className="text-xl font-bold mb-2">Growth</h3>
                            <div className="text-4xl font-bold mb-4">$30<span className="text-sm text-[var(--foreground-secondary)]">/mo</span></div>
                            <ul className="space-y-3 mb-8 text-[var(--foreground-secondary)] text-sm">
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> 3 Active Job Posts</li>
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> Basic AI Matching</li>
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> Email Support</li>
                            </ul>
                            <button disabled className="btn w-full bg-gray-100 text-gray-400 cursor-not-allowed">Coming Soon</button>
                        </div>

                        {/* Tier 2 */}
                        <div className="card p-8 border-2 border-[var(--accent-orange)] relative transform md:-translate-y-4 shadow-xl">
                            <div className="absolute top-0 right-0 bg-[var(--accent-orange)] text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">RECOMMENDED</div>
                            <h3 className="text-xl font-bold mb-2">Scale</h3>
                            <div className="text-4xl font-bold mb-4">$45<span className="text-sm text-[var(--foreground-secondary)]">/mo</span></div>
                            <ul className="space-y-3 mb-8 text-[var(--foreground-secondary)] text-sm">
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> 10 Active Job Posts</li>
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> Advanced AI Ranking</li>
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> Team Collaboration</li>
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> Interview Scheduler</li>
                            </ul>
                            <button disabled className="btn w-full bg-[var(--accent-orange)] opacity-15 text-white cursor-not-allowed">Coming Soon</button>
                        </div>

                        {/* Tier 3 */}
                        <div className="card p-8 border border-[var(--border)] hover:border-[var(--accent-orange)] transition-all">
                            <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                            <div className="text-4xl font-bold mb-4">$60<span className="text-sm text-[var(--foreground-secondary)]">/mo</span></div>
                            <ul className="space-y-3 mb-8 text-[var(--foreground-secondary)] text-sm">
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> Unlimited Jobs</li>
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> Dedicated Account Manager</li>
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> ATS Integration</li>
                                <li className="flex gap-2"><Check className="w-5 h-5 text-[var(--success)]" /> API Access</li>
                            </ul>
                            <button disabled className="btn w-full bg-gray-100 text-gray-400 cursor-not-allowed">Coming Soon</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
