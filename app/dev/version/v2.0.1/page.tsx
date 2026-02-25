import Link from "next/link";
import { ArrowLeft, Bug } from "lucide-react";

export default function Version2_0_1() {
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
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-purple-500/20 text-purple-400 rounded-full mb-4">
                        Patch Release
                    </span>
                    <h1 className="text-4xl font-bold mb-4">v2.0.1</h1>
                    <p className="text-[var(--foreground-secondary)]">Released February 25, 2026</p>
                </div>

                <div className="space-y-10">
                    {/* Summary */}
                    <section className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-[var(--foreground)]">Summary</h2>
                        <p className="text-[var(--foreground-secondary)] leading-relaxed">
                            Version 2.0.1 is a patch release focused on fixing critical routing issues in the Recruiter dashboard that were causing 404 errors during job creation and profile navigation.
                        </p>
                    </section>

                    {/* Bug Fixes */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <Bug className="w-6 h-6 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-semibold text-[var(--foreground)]">Bug Fixes</h2>
                        </div>
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                            <ul className="space-y-3 text-[var(--foreground-secondary)]">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span><strong>Recruiter Job Creation:</strong> Fixed a bug where creating a job would redirect the recruiter to a 404 page due to a missing dashboard ID in the URL.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span><strong>Recruiter Form Links:</strong> Fixed the "Cancel" and "Use AI Job Description Generator" links inside the job creation form to include the correct parameterized dashboard route.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span><strong>Recruiter Profile Page:</strong> Fixed the "Edit Profile" link on the profile preview page pointing to a hardcoded "dashboard" path rather than the dynamically hydrated parameter.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Files Changed */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-[var(--foreground)]">Files Changed</h2>
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                            <div className="grid gap-2 text-sm font-mono text-[var(--foreground-secondary)]">
                                <div className="flex items-center gap-2"><span className="text-yellow-400">~</span> app/app/org/recruiter/[dashboard]/jobs/create/page.tsx</div>
                                <div className="flex items-center gap-2"><span className="text-yellow-400">~</span> app/app/org/recruiter/[dashboard]/profile/page.tsx</div>
                                <div className="flex items-center gap-2"><span className="text-green-400">+</span> app/dev/version/v2.0.1/page.tsx</div>
                                <div className="flex items-center gap-2"><span className="text-yellow-400">~</span> app/dev/version/page.tsx</div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}