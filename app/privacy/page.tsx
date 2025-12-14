'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            <div className="absolute top-0 left-0 w-full h-[50vh] z-0 opacity-15 overflow-hidden pointer-events-none">
                <Image
                    src="/secured.png"
                    alt="Privacy Background"
                    fill
                    className="object-cover object-center"
                    priority
                />
            </div>

            <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto relative z-10">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <p className="text-[var(--foreground-secondary)] mb-8">Last Updated: December 14, 2024</p>

                <div className="prose prose-lg max-w-none text-[var(--foreground-secondary)]">
                    <p className="mb-6">
                        At SwiftAI Recruit, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website including any other media form, media channel, mobile website, or mobile application related or connected thereto.
                    </p>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-8 mb-4">1. Collection of Information</h2>
                    <p className="mb-4">
                        We may collect information about you in a variety of ways. The information we may collect on the Site includes:
                    </p>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number.</li>
                        <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-8 mb-4">2. Use of Your Information</h2>
                    <p className="mb-4">
                        Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                    </p>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li>Create and manage your account.</li>
                        <li>Compile anonymous statistical data and analysis for use internally or with third parties.</li>
                        <li>Email you regarding your account or order.</li>
                        <li>Enable user-to-user communications.</li>
                        <li>Generate a personal profile about you to make future visits to the Site more personalized.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-8 mb-4">3. Disclosure of Your Information</h2>
                    <p className="mb-6">
                        We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                    </p>
                    <p className="mb-6">
                        <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
                    </p>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-8 mb-4">4. Security of Your Information</h2>
                    <p className="mb-6">
                        We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}
