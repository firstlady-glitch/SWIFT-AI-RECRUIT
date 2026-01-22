'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, ArrowRight, Briefcase, Search, FileText, UserCheck, Calendar, BarChart, Users, Zap, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import Footer from '@/components/Footer';

function FeaturesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'applicant' | 'employer'>('applicant');

    // Handle URL params
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'employer') setActiveTab('employer');
        else if (tab === 'applicant') setActiveTab('applicant');
    }, [searchParams]);

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
                            onClick={() => {
                                setActiveTab('applicant');
                                router.push('/features?tab=applicant');
                            }}
                            className={`px-7 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'applicant'
                                ? 'bg-white text-[var(--primary-blue)] shadow-lg'
                                : 'bg-[#1f1f1f] text-gray-200 hover:bg-[#2a2a2a]'
                                }`}
                        >
                            Job Seekers
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('employer');
                                router.push('/features?tab=employer');
                            }}
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

            <Footer />
        </div>
    );
}

export default function FeaturesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>}>
            <FeaturesContent />
        </Suspense>
    );
}

function ApplicantContent() {
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

    const plans = [
        { name: 'Starter', price: 15, cta: 'Get Started', href: '/pricing?role=applicant' },
        { name: 'Professional', price: 30, cta: 'Start Free Trial', href: '/pricing?role=applicant', popular: true },
        { name: 'Career+', price: 45, cta: 'Get Started', href: '/pricing?role=applicant' },
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

            {/* AI Tools Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-white">
                <div className="max-w-3xl">
                    <h2 className="text-3xl font-bold mb-4 !text-white">5 Powerful AI Tools</h2>
                    <p className="!text-white/90 mb-6">
                        Our AI suite helps you stand out from the competition and land your dream job faster.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-400" />
                            <span>Resume Parser & Optimizer</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-400" />
                            <span>Cover Letter Generator</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-400" />
                            <span>Interview Prep Coach</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-400" />
                            <span>Job Fit Analysis</span>
                        </div>
                    </div>
                    {process.env.NEXT_PUBLIC_ACCEPT_PAYMENTS !== 'false' && (
                        <Link href="/pricing?role=applicant" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                            View Pricing <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Quick Pricing */}
            {process.env.NEXT_PUBLIC_ACCEPT_PAYMENTS !== 'false' && (
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
                    <p className="text-[var(--foreground-secondary)] mb-8">Start for free, upgrade when you're ready.</p>
                    <div className="flex flex-wrap justify-center gap-6">
                        {plans.map((plan) => (
                            <Link
                                key={plan.name}
                                href={plan.href}
                                className={`px-8 py-4 rounded-xl border transition-all hover:scale-105 ${plan.popular
                                    ? 'bg-[var(--primary-blue)] text-white border-[var(--primary-blue)]'
                                    : 'border-gray-200 hover:border-[var(--primary-blue)]'
                                    }`}
                            >
                                <div className="font-bold">{plan.name}</div>
                                <div className="text-2xl font-bold">${plan.price}<span className="text-sm font-normal">/mo</span></div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function EmployerContent() {
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

    const plans = [
        { name: 'Growth', price: 99, cta: 'Get Started', href: '/pricing?role=employer' },
        { name: 'Scale', price: 249, cta: 'Start Free Trial', href: '/pricing?role=employer', popular: true },
        { name: 'Enterprise', price: 499, cta: 'Contact Sales', href: '/pricing?role=employer' },
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

            {/* AI Tools Section */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-700 rounded-2xl p-8 md:p-12 text-white">
                <div className="max-w-3xl">
                    <h2 className="text-3xl font-bold mb-4 !text-white">5 Powerful AI Hiring Tools</h2>
                    <p className="!text-white/90 mb-6">
                        Hire faster and smarter with AI that screens, ranks, and helps you make better decisions.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-300" />
                            <span>AI Job Description Generator</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-300" />
                            <span>Candidate Ranking & Scoring</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-300" />
                            <span>Interview Script Builder</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-300" />
                            <span>Offer Letter Generator</span>
                        </div>
                    </div>
                    {process.env.NEXT_PUBLIC_ACCEPT_PAYMENTS !== 'false' && (
                        <Link href="/pricing?role=employer" className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
                            View Pricing <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Quick Pricing */}
            {process.env.NEXT_PUBLIC_ACCEPT_PAYMENTS !== 'false' && (
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Plans for Every Team Size</h2>
                    <p className="text-[var(--foreground-secondary)] mb-8">Scale your hiring without scaling your budget.</p>
                    <div className="flex flex-wrap justify-center gap-6">
                        {plans.map((plan) => (
                            <Link
                                key={plan.name}
                                href={plan.href}
                                className={`px-8 py-4 rounded-xl border transition-all hover:scale-105 ${plan.popular
                                    ? 'bg-[var(--accent-orange)] text-white border-[var(--accent-orange)]'
                                    : 'border-gray-200 hover:border-[var(--accent-orange)]'
                                    }`}
                            >
                                <div className="font-bold">{plan.name}</div>
                                <div className="text-2xl font-bold">${plan.price}<span className="text-sm font-normal">/mo</span></div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
