import Link from 'next/link';
import { ArrowLeft, Sparkles, Link2 } from 'lucide-react';

export default function Version2_1_0() {
    return (
        <div className="min-h-screen bg-[var(--background)] p-8 font-sans text-[var(--foreground)]">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/dev/version"
                    className="inline-flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to History
                </Link>

                <div className="mb-8">
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full mb-4">
                        Minor Release
                    </span>
                    <h1 className="text-4xl font-bold mb-4">v2.1.0</h1>
                    <p className="text-[var(--foreground-secondary)]">Released May 3, 2026</p>
                </div>

                <div className="space-y-10">
                    <section className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-[var(--foreground)]">Summary</h2>
                        <p className="text-[var(--foreground-secondary)] leading-relaxed">
                            Production hardening pass: real contact delivery, canonical blog content, Groq-backed
                            AI APIs, recruiter job editing, navigation that matches every live route, and billing
                            flows that map cleanly to Stripe plan keys instead of placeholder UI states.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[var(--primary-blue)]/15 rounded-lg">
                                <Sparkles className="w-6 h-6 text-[var(--primary-blue)]" />
                            </div>
                            <h2 className="text-2xl font-semibold text-[var(--foreground)]">Features & fixes</h2>
                        </div>
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                            <ul className="space-y-3 text-[var(--foreground-secondary)]">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>
                                        <strong>Recruiter job edit:</strong> Added{' '}
                                        <code className="text-xs bg-[var(--background)] px-1 rounded">
                                            /app/org/recruiter/[dashboard]/jobs/[id]/edit
                                        </code>{' '}
                                        so draft jobs open the same API-backed form employers already used.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>
                                        <strong>AI stack:</strong> Chat and generate routes use Groq Chat
                                        Completions (<code className="text-xs">NEXT_PUBLIC_GROQ_API_KEY</code>
                                        ). Removed Gemini dependency.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>
                                        <strong>Contact form:</strong> Submits to{' '}
                                        <code className="text-xs">POST /api/contact</code> with Nodemailer; falls
                                        back to <code className="text-xs">mailto:</code> when SMTP is not configured.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>
                                        <strong>Blog:</strong> Single source in{' '}
                                        <code className="text-xs">lib/blog-posts.ts</code> — no orphan slugs or fake
                                        engagement counters; share and copy-link only.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>
                                        <strong>Navigation:</strong> Sidebar links for Messages (applicant, employer,
                                        recruiter) and Sourcing + Messages for employers; dashboard quick links
                                        aligned.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>
                                        <strong>Billing UX:</strong> Org onboarding maps UI tiers to Stripe keys (
                                        <code className="text-xs">pro → growth</code>,{' '}
                                        <code className="text-xs">team → scale</code>). Applicant paid cards start
                                        Career+ checkout when <code className="text-xs">acceptPayments</code> is on.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Link2 className="w-6 h-6 text-[var(--foreground-secondary)]" />
                            <h2 className="text-2xl font-semibold text-[var(--foreground)]">Developer hub</h2>
                        </div>
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 text-[var(--foreground-secondary)] text-sm">
                            <p className="mb-3">
                                Internal release notes live under{' '}
                                <Link href="/dev" className="text-[var(--primary-blue)] hover:underline">
                                    /dev
                                </Link>{' '}
                                and{' '}
                                <Link href="/dev/version" className="text-[var(--primary-blue)] hover:underline">
                                    /dev/version
                                </Link>
                                .
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-[var(--foreground)]">Files touched (high level)</h2>
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 text-sm font-mono text-[var(--foreground-secondary)] space-y-1">
                            <div>lib/blog-posts.ts, lib/whatsapp.ts, lib/groq.ts</div>
                            <div>app/api/contact/route.ts, app/api/chat/route.ts, app/api/ai/generate/route.ts</div>
                            <div>app/contact/page.tsx, app/blog/*, components/dashboard/Sidebar.tsx</div>
                            <div>app/app/org/page.tsx, app/app/applicant/setup/page.tsx</div>
                            <div>app/app/org/recruiter/.../jobs/[id]/edit/page.tsx</div>
                            <div>app/dev/version/page.tsx, app/dev/page.tsx</div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
