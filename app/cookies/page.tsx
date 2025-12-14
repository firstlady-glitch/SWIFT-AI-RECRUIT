'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            <div className="absolute top-0 left-0 w-full h-[50vh] z-0 opacity-15 overflow-hidden pointer-events-none">
                <Image
                    src="/cookies.png"
                    alt="Cookie Policy Background"
                    fill
                    className="object-cover object-center"
                    priority
                />
            </div>

            <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto relative z-10">
                <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>

                <div className="prose prose-lg max-w-none text-[var(--foreground-secondary)]">
                    <p className="mb-6">
                        This Cookie Policy explains how SwiftAI Recruit uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
                    </p>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-8 mb-4">1. What are cookies?</h2>
                    <p className="mb-6">
                        Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
                    </p>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-8 mb-4">2. Why do we use cookies?</h2>
                    <p className="mb-4">
                        We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties.
                    </p>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-8 mb-4">3. Types of Cookies We Use</h2>
                    <ul className="list-disc pl-6 mb-6 space-y-2">
                        <li><strong>Essential Cookies:</strong> Strictly necessary for authentication and security.</li>
                        <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our site (e.g., Google Analytics).</li>
                        <li><strong>Functionality Cookies:</strong> Remember your preferences (like language or region).</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-8 mb-4">4. Managing Cookies</h2>
                    <p className="mb-6">
                        You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. Using the browser settings to block cookies may impact the functionality of the site.
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}
