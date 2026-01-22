import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Version1_11_2() {
    return (
        <div className="min-h-screen bg-[var(--background)] p-8 font-sans text-[var(--foreground)]">
            <div className="max-w-3xl mx-auto">
                <Link
                    href="/dev/version"
                    className="inline-flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to History
                </Link>

                <h1 className="text-4xl font-bold mb-4">v1.11.2</h1>
                <p className="text-[var(--foreground-secondary)] mb-8">Released January 22, 2026</p>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-[var(--foreground)]">Summary</h2>
                        <p className="text-[var(--foreground-secondary)] leading-relaxed">
                            This update introduces a robust mechanism to conditionally hide pricing and subscription-related features. This allows the application to operate in a "no-payments" mode, suitable for beta testing or specific deployment environments where monetization is disabled.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-[var(--foreground)]">Key Changes</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-medium mb-2 text-[var(--primary-blue)]">Environment Control</h3>
                                <ul className="list-disc pl-5 space-y-2 text-[var(--foreground-secondary)]">
                                    <li>Introduced <code>NEXT_PUBLIC_ACCEPT_PAYMENTS</code> environment variable.</li>
                                    <li>When set to <code>false</code>, all payment-related UI and logic are disabled.</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-medium mb-2 text-[var(--primary-blue)]">Routing & Security</h3>
                                <ul className="list-disc pl-5 space-y-2 text-[var(--foreground-secondary)]">
                                    <li>Implemented middleware redirects in <code>proxy.ts</code> to block access to <code>/pricing</code> when payments are disabled.</li>
                                    <li>Users attempting to access pricing pages are redirected to <code>/auth/login</code>.</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-medium mb-2 text-[var(--primary-blue)]">UI Adaptations</h3>
                                <ul className="list-disc pl-5 space-y-2 text-[var(--foreground-secondary)]">
                                    <li>Conditionally hidden "Pricing" link in the global Footer.</li>
                                    <li>Removed "View Pricing" buttons and "Quick Pricing" cards from the Features page.</li>
                                    <li>Hidden "Subscription" settings tabs for both Employer and Recruiter dashboards.</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
