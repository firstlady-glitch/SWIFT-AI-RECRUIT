'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            <div className="absolute top-0 left-0 w-full h-[50vh] z-0 opacity-15 overflow-hidden pointer-events-none">
                <Image
                    src="/terms.png"
                    alt="Terms Background"
                    fill
                    className="object-cover object-center"
                    priority
                />
            </div>

            <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto relative z-10">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <p className="text-[var(--foreground-secondary)] mb-8">Last Updated: December 14, 2024</p>

                <div className="prose prose-lg max-w-none text-[var(--foreground-secondary)]">
                    <p className="mb-6">
                        These Terms of Service ("Terms") concerning the access to and use of the SwiftAI Recruit website, application, and services. By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy.
                    </p>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-8 mb-4">1. Acceptance of Terms</h2>
                    <p className="mb-6">
                        By accessing or using the Site in any manner, getting information from the site, or registering your details on the site, you agree to bound by these terms and conditions. If you do not agree to the terms and conditions of this agreement, you must leave this website immediately.
                    </p>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-8 mb-4">2. User Accounts</h2>
                    <p className="mb-6">
                        You may need to register for an account to access some or all of our Services. You must provide accurate and complete information when creating your account. You are solely responsible for validtiy of your account information and for any activity that occurs on your account.
                    </p>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-8 mb-4">3. Use of Services</h2>
                    <p className="mb-6">
                        You agree to use the Services only for purposes that are permitted by these Terms and any applicable law, regulation or generally accepted practices or guidelines in the relevant jurisdictions.
                    </p>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-8 mb-4">4. Intellectual Property</h2>
                    <p className="mb-6">
                        The content, organization, graphics, design, compilation, magnetic translation, digital conversion and other matters related to the Site are protected under applicable copyrights, trademarks and other proprietary (including but not limited to intellectual property) rights.
                    </p>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-8 mb-4">5. Termination</h2>
                    <p className="mb-6">
                        We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}
