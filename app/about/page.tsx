'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Users, Target, Globe, Zap, Shield, Award } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            {/* Hero */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-15">
                    <Image
                        src="/about-us.png"
                        alt="About Background"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                </div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Revolutionizing Recruitment with <span className="text-[var(--primary-blue)]">Artificial Intelligence</span>
                    </h1>
                    <p className="text-xl text-[var(--foreground-secondary)] leading-relaxed">
                        We are on a mission to democratize job opportunities and streamline hiring through the power of ethical AI. SwiftAI Recruit isn't just a platform; it's a movement towards a fairer, faster, and more efficient global labor market.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 bg-[var(--background-secondary)]">
                <div className="section">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                                <Target className="w-6 h-6 text-[var(--primary-blue)]" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                            <p className="text-[var(--foreground-secondary)] mb-6">
                                To redefine the recruitment experience by leveraging artificial intelligence to provide unparalleled speed and precision in matching qualified candidates with their ideal positions. We aim to eliminate bias, reduce hiring timelines, and unlock human potential on a global scale.
                            </p>
                        </div>
                        <div>
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                                <Globe className="w-6 h-6 text-[var(--accent-orange)]" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
                            <p className="text-[var(--foreground-secondary)] mb-6">
                                We envision a future where the recruitment process is not only faster and more accurate but also inclusive and accessible to all. A world where talent is effortlessly discovered, regardless of geography or background.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20">
                <div className="section">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
                        <p className="text-[var(--foreground-secondary)]">The principles that drive every decision we make.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="card p-8">
                            <Zap className="w-10 h-10 text-[var(--accent-orange)] mb-6" />
                            <h3 className="text-xl font-bold mb-3">Innovation First</h3>
                            <p className="text-[var(--foreground-secondary)]">
                                We constantly push the boundaries of what's possible with AI to create smarter solutions.
                            </p>
                        </div>
                        <div className="card p-8">
                            <Users className="w-10 h-10 text-[var(--primary-blue)] mb-6" />
                            <h3 className="text-xl font-bold mb-3">People Centric</h3>
                            <p className="text-[var(--foreground-secondary)]">
                                Technology should serve people. We build tools that empower candidates and recruiters alike.
                            </p>
                        </div>
                        <div className="card p-8">
                            <Shield className="w-10 h-10 text-[var(--success)] mb-6" />
                            <h3 className="text-xl font-bold mb-3">Integrity & Trust</h3>
                            <p className="text-[var(--foreground-secondary)]">
                                We handle careers and company growth. That requires the highest standards of ethics and data privacy.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-20 bg-[var(--primary-blue)] text-white">
                <div className="section grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-4xl font-bold mb-2">50k+</div>
                        <div className="text-blue-100">Successful Hires</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold mb-2">98%</div>
                        <div className="text-blue-100">Match Accuracy</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold mb-2">120+</div>
                        <div className="text-blue-100">Countries Served</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold mb-2">24/7</div>
                        <div className="text-blue-100">AI Availability</div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
