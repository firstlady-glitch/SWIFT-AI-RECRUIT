import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Version1_11_1() {
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

                <h1 className="text-4xl font-bold mb-4">v1.11.1</h1>
                <p className="text-[var(--foreground-secondary)] mb-8">Released January 21, 2026</p>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-[var(--foreground)]">Summary</h2>
                        <p className="text-[var(--foreground-secondary)] leading-relaxed">
                            This update focuses on critical UI improvements for Light Mode consistency and refinements to the Recruiter Signup flow for better usability and relevance.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-[var(--foreground)]">Key Changes</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-medium mb-2 text-[var(--primary-blue)]">UI & Theme Consistency</h3>
                                <ul className="list-disc pl-5 space-y-2 text-[var(--foreground-secondary)]">
                                    <li>Fixed Landing Page "5 Powerful AI Tools" section text visibility in all modes.</li>
                                    <li>Refactored Registration Page (`/auth/register`) to use semantic colors instead of hardcoded dark values, enabling proper Light Mode.</li>
                                    <li>Updated Global Input styles to automatically adapt to theme context.</li>
                                    <li>Fixed Sidebar colors to respect Light/Dark theme settings.</li>
                                    <li>Ensured Role Selection cards have proper contrast.</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-medium mb-2 text-[var(--primary-blue)]">Recruiter Signup Flow</h3>
                                <ul className="list-disc pl-5 space-y-2 text-[var(--foreground-secondary)]">
                                    <li>Simplified Recruiter Registration form by removing unnecessary fields (Agency Name, Team Size, Website, Business Phone) for freelance recruiters.</li>
                                    <li>Added "Full Name" and "Email Address" fields to the signup form.</li>
                                    <li>Updated organization creation logic to map "Full Name" to organization name for freelancers.</li>
                                    <li>Renamed "Office Location" to "Location".</li>
                                    <li>Updated database schema to support recruiter email contact.</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
