import Link from 'next/link';
import { Rocket, ArrowRight } from 'lucide-react';

export default function FinalCTA() {
    return (
        <section id="get-started" className="solution-section py-20 bg-[var(--background-secondary)]">
            <div className="max-w-3xl">
                <div className="flex mb-6 animate-float">
                    <Rocket className="w-16 h-16 text-[var(--primary-blue)]" />
                </div>
                <h2 className="mb-6">
                    Your Dream Job Is Out There.<br />
                    <span className="text-gradient">Let's Go Get It.</span>
                </h2>
                <p className="text-xl text-[var(--foreground-secondary)] mb-8">
                    Join thousands of professionals who have transformed their job search with SwiftAI Recruit.
                    Start for free—no credit card required.
                </p>
                <Link href="/auth" className="btn btn-primary text-lg px-10 py-5 text-xl">
                    Get Started Free <ArrowRight className="w-6 h-6" />
                </Link>
                <p className="text-sm text-[var(--foreground-secondary)] mt-4">
                    Free forever. Upgrade only when you need advanced features.
                </p>
            </div>
        </section>
    );
}
