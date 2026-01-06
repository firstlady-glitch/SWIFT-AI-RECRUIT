import Link from 'next/link';
import { Trophy, ArrowRight } from 'lucide-react';

export default function Hero() {
    return (
        <section className="section py-20 md:py-32">
            <div className="max-w-4xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-orange)]/10 border border-[var(--accent-orange)]/20 mb-6 animate-slide-down">
                    <Trophy className="w-5 h-5 text-[var(--accent-orange)]" />
                    <span className="text-sm font-semibold text-[var(--accent-orange)]">#1 AI Recruitment Platform</span>
                </div>

                {/* Main Headline */}
                <h1 className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    Start Landing <span className="text-gradient">Offers</span>
                </h1>

                <p className="text-lg mb-8 max-w-3xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    Revolutionize your recruitment journey with AI-driven solutions. Generate tailored resumes and cover letters that match each role, manage your job search, and track every application—all in one intelligent platform.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <Link href="/auth/register?role=applicant" className="btn btn-primary">
                        <span>Get Started Free</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/auth/register?role=org" className="btn btn-outline">
                        <span>Hire a Talent</span>
                    </Link>
                </div>

                {/* Social Proof */}
                <div className="flex flex-col gap-3 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center -space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary-blue)] border-2 border-[var(--background)] flex items-center justify-center text-white text-sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[var(--accent-orange)] border-2 border-[var(--background)] flex items-center justify-center text-white text-sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[var(--cyan)] border-2 border-[var(--background)] flex items-center justify-center text-white text-sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[var(--purple)] border-2 border-[var(--background)] flex items-center justify-center text-white text-sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[var(--success)] border-2 border-[var(--background)] flex items-center justify-center text-white text-sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-[var(--foreground-secondary)]">
                        Trusted by <span className="font-semibold text-[var(--foreground)]">10,000+</span> job seekers and recruiters worldwide
                    </p>
                </div>
            </div>
        </section>
    );
}
