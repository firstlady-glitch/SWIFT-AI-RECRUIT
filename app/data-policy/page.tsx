'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function DataPolicyPage() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            <div className="absolute top-0 left-0 w-full h-[50vh] z-0 opacity-15 overflow-hidden pointer-events-none">
                <Image
                    src="/data-policy.png"
                    alt="Data Policy Background"
                    fill
                    className="object-cover object-center"
                    priority
                />
            </div>

            <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto relative z-10">
                <h1 className="text-4xl font-bold mb-8">Data Policy</h1>
                <p className="text-[var(--foreground-secondary)] mb-8">Your data, your control.</p>

                <div className="prose prose-lg max-w-none text-[var(--foreground-secondary)]">
                    <p className="mb-6">
                        At SwiftAI Recruit, we believe in radical transparency regarding how we use data to power our AI models. This Data Policy complements our Privacy Policy by strictly focusing on AI data usage, retention, and processing.
                    </p>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-8 mb-4">1. AI Processing & Training</h2>
                    <p className="mb-6">
                        We do NOT use your private data to train our core foundation models without your explicit consent. When you use our matching features, data is processed ephemerally to generate scores and recommendations, then discarded from the inference engine context window.
                    </p>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-8 mb-4">2. Data Retention</h2>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li><strong>Candidate Profiles:</strong> Retained as long as your account is active. You can download or delete your data at any time.</li>
                        <li><strong>Application History:</strong> Retained for 2 years by default to help you track your career progress, unless deleted earlier.</li>
                        <li><strong>Chat Logs:</strong> Retained for 1 year for quality assurance and dispute resolution.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-8 mb-4">3. Data Portability</h2>
                    <p className="mb-6">
                        You have the right to request a copy of all data we hold about you in a machine-readable format (JSON/CSV). You can initiate this request from your dashboard settings.
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}
