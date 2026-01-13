'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Check, X, Loader2, Sparkles, DollarSign, Euro, Globe } from 'lucide-react';
import Link from 'next/link';

// Currency conversion rates (base USD)
const CURRENCY_CONFIG = {
    USD: { symbol: '$', rate: 1, name: 'USD' },
    EUR: { symbol: '€', rate: 0.92, name: 'EUR' },
    NGN: { symbol: '₦', rate: 1550, name: 'NGN' },
};

type Currency = keyof typeof CURRENCY_CONFIG;

// Plan data matching lib/stripe.ts (prices in USD)
const APPLICANT_PLANS = [
    {
        key: 'starter',
        name: 'Starter',
        priceMonthly: 15,
        priceAnnual: 12,
        description: 'For individuals just starting out',
        features: [
            { text: '5 AI Resume builds', included: true },
            { text: 'Basic job matching', included: true },
            { text: 'Application tracking', included: true },
            { text: 'Cover Letter Generator', included: false },
            { text: 'Priority Support', included: false },
        ],
        popular: false,
    },
    {
        key: 'pro',
        name: 'Professional',
        priceMonthly: 30,
        priceAnnual: 24,
        description: 'For serious job seekers',
        features: [
            { text: 'Unlimited AI Resumes', included: true },
            { text: 'Priority job matching', included: true },
            { text: 'Cover Letter Generator', included: true },
            { text: 'Interview AI Practice', included: true },
            { text: 'Email Support', included: true },
        ],
        popular: true,
    },
    {
        key: 'career_plus',
        name: 'Career+',
        priceMonthly: 45,
        priceAnnual: 36,
        description: 'Maximum career advantage',
        features: [
            { text: 'Everything in Professional', included: true },
            { text: '1-on-1 Career Coaching', included: true },
            { text: 'Salary Negotiation Help', included: true },
            { text: 'Featured Profile Badge', included: true },
            { text: 'Priority Support', included: true },
        ],
        popular: false,
    },
];

const EMPLOYER_PLANS = [
    {
        key: 'growth',
        name: 'Growth',
        priceMonthly: 99,
        priceAnnual: 79,
        description: 'For small teams',
        features: [
            { text: '3 Active Job Posts', included: true },
            { text: 'Basic AI Matching', included: true },
            { text: 'Email Support', included: true },
            { text: 'Team Collaboration', included: false },
            { text: 'Interview Scheduler', included: false },
        ],
        popular: false,
    },
    {
        key: 'scale',
        name: 'Scale',
        priceMonthly: 249,
        priceAnnual: 199,
        description: 'For growing companies',
        features: [
            { text: '10 Active Job Posts', included: true },
            { text: 'Advanced AI Ranking', included: true },
            { text: 'Team Collaboration (5 seats)', included: true },
            { text: 'Interview Scheduler', included: true },
            { text: 'Priority Support', included: true },
        ],
        popular: true,
    },
    {
        key: 'enterprise',
        name: 'Enterprise',
        priceMonthly: 499,
        priceAnnual: 399,
        description: 'For large organizations',
        features: [
            { text: 'Unlimited Job Posts', included: true },
            { text: 'Dedicated Account Manager', included: true },
            { text: 'Unlimited Team Seats', included: true },
            { text: 'API Access', included: true },
            { text: 'Custom Integrations', included: true },
        ],
        popular: false,
    },
];

const RECRUITER_PLANS = [
    {
        key: 'recruiter_starter',
        name: 'Freelance',
        priceMonthly: 49,
        priceAnnual: 39,
        description: 'For independent recruiters',
        features: [
            { text: 'Access Employer Jobs', included: true },
            { text: '10 Candidate Submissions/mo', included: true },
            { text: 'Basic AI Tools', included: true },
            { text: 'Commission Tracking', included: false },
            { text: 'Priority Placement', included: false },
        ],
        popular: false,
    },
    {
        key: 'recruiter_pro',
        name: 'Pro Recruiter',
        priceMonthly: 99,
        priceAnnual: 79,
        description: 'For professional recruiters',
        features: [
            { text: 'Unlimited Employer Jobs', included: true },
            { text: 'Unlimited Submissions', included: true },
            { text: 'All AI Sourcing Tools', included: true },
            { text: 'Commission Tracking', included: true },
            { text: 'Priority Support', included: true },
        ],
        popular: true,
    },
    {
        key: 'agency',
        name: 'Agency',
        priceMonthly: 299,
        priceAnnual: 239,
        description: 'For recruitment agencies',
        features: [
            { text: 'Everything in Pro', included: true },
            { text: 'Team Management (10 seats)', included: true },
            { text: 'White-label Options', included: true },
            { text: 'Bulk Submission Tools', included: true },
            { text: 'Dedicated Support', included: true },
        ],
        popular: false,
    },
];

export default function PricingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        }>
            <PricingContent />
        </Suspense>
    );
}

function PricingContent() {
    const searchParams = useSearchParams();
    const [isAnnual, setIsAnnual] = useState(true);
    const [activeTab, setActiveTab] = useState<'applicant' | 'employer' | 'recruiter'>('applicant');
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [currency, setCurrency] = useState<Currency>('USD');

    // Handle URL params for role
    useEffect(() => {
        const role = searchParams.get('role');
        if (role === 'employer') setActiveTab('employer');
        else if (role === 'recruiter') setActiveTab('recruiter');
        else if (role === 'applicant') setActiveTab('applicant');
    }, [searchParams]);

    const formatPrice = (priceUSD: number) => {
        const { symbol, rate } = CURRENCY_CONFIG[currency];
        const converted = Math.round(priceUSD * rate);

        if (currency === 'NGN') {
            return `${symbol}${converted.toLocaleString()}`;
        }
        return `${symbol}${converted}`;
    };

    const handleSubscribe = async (planKey: string, role: string) => {
        setLoadingPlan(planKey);

        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planKey,
                    interval: isAnnual ? 'annual' : 'monthly',
                    role,
                    currency,
                }),
            });

            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else if (data.redirect) {
                window.location.href = `/auth/register?role=${role}&plan=${planKey}`;
            } else {
                console.error('Checkout error:', data.error);
                alert(data.error || 'Unable to start checkout');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoadingPlan(null);
        }
    };

    const getPlans = () => {
        switch (activeTab) {
            case 'employer': return EMPLOYER_PLANS;
            case 'recruiter': return RECRUITER_PLANS;
            default: return APPLICANT_PLANS;
        }
    };

    const getAccentColor = () => {
        switch (activeTab) {
            case 'employer': return 'var(--accent-orange)';
            case 'recruiter': return '#8B5CF6';
            default: return 'var(--primary-blue)';
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            <section className="pt-32 pb-20 px-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-500">Save 20% with annual billing</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
                <p className="text-xl text-[var(--foreground-secondary)] max-w-2xl mx-auto mb-8">
                    Choose the plan that's right for you. No hidden fees, cancel anytime.
                </p>

                {/* Role Tabs */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('applicant')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'applicant'
                            ? 'bg-[var(--primary-blue)] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Job Seekers
                    </button>
                    <button
                        onClick={() => setActiveTab('employer')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'employer'
                            ? 'bg-[var(--accent-orange)] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Employers
                    </button>
                    <button
                        onClick={() => setActiveTab('recruiter')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'recruiter'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Recruiters
                    </button>
                </div>

                {/* Currency Toggle */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <div className="inline-flex bg-gray-800 rounded-lg p-1">
                        {(Object.keys(CURRENCY_CONFIG) as Currency[]).map((curr) => (
                            <button
                                key={curr}
                                onClick={() => setCurrency(curr)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currency === curr
                                    ? 'bg-white text-gray-900'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {curr === 'USD' && <span className="mr-1">$</span>}
                                {curr === 'EUR' && <span className="mr-1">€</span>}
                                {curr === 'NGN' && <span className="mr-1">₦</span>}
                                {curr}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mb-16">
                    <span className={`font-medium ${!isAnnual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
                    <button
                        onClick={() => setIsAnnual(!isAnnual)}
                        className="relative w-14 h-8 rounded-full transition-colors"
                        style={{ backgroundColor: getAccentColor() }}
                    >
                        <div
                            className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isAnnual ? 'right-1' : 'left-1'
                                }`}
                        />
                    </button>
                    <span className={`font-medium ${isAnnual ? 'text-white' : 'text-gray-500'}`}>
                        Annual
                        <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                            -20%
                        </span>
                    </span>
                </div>

                {/* Pricing Cards */}
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 px-4">
                    {getPlans().map((plan) => (
                        <div
                            key={plan.key}
                            className={`card p-8 border transition-all relative ${plan.popular
                                ? `border-2 transform md:-translate-y-4 shadow-xl`
                                : 'border-[var(--border)] hover:border-gray-600'
                                }`}
                            style={plan.popular ? { borderColor: getAccentColor() } : {}}
                        >
                            {plan.popular && (
                                <div
                                    className="absolute top-0 right-0 left-0 text-white text-xs font-bold py-1 rounded-t-lg"
                                    style={{ backgroundColor: getAccentColor() }}
                                >
                                    MOST POPULAR
                                </div>
                            )}
                            <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'mt-4' : ''}`}>{plan.name}</h3>
                            <p className="text-[var(--foreground-secondary)] text-sm mb-6">{plan.description}</p>
                            <div className="text-4xl font-bold mb-6">
                                {formatPrice(isAnnual ? plan.priceAnnual : plan.priceMonthly)}
                                <span className="text-lg text-[var(--foreground-secondary)] font-normal">/mo</span>
                            </div>

                            <button
                                onClick={() => handleSubscribe(plan.key, activeTab)}
                                disabled={loadingPlan === plan.key}
                                className={`w-full py-3 rounded-lg font-medium mb-8 transition-all flex items-center justify-center gap-2 ${plan.popular
                                    ? 'text-white hover:opacity-90'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                    }`}
                                style={plan.popular ? { backgroundColor: getAccentColor() } : {}}
                            >
                                {loadingPlan === plan.key ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    'Get Started'
                                )}
                            </button>

                            <ul className="space-y-4 text-left text-sm">
                                {plan.features.map((feature, idx) => (
                                    <li
                                        key={idx}
                                        className={`flex gap-3 ${feature.included ? '' : 'text-gray-400'}`}
                                    >
                                        {feature.included ? (
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        ) : (
                                            <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        )}
                                        {feature.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Free tier note */}
                <p className="text-center text-gray-500 mt-12">
                    All plans include a 14-day free trial. No credit card required to start.
                </p>
            </section>

            <Footer />
        </div>
    );
}
