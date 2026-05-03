import Link from 'next/link';
import { ArrowLeft, BookMarked, Home, Terminal } from 'lucide-react';

export default function DevHubPage() {
    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8">
            <div className="max-w-2xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] mb-10"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to site
                </Link>

                <div className="flex items-center gap-3 mb-4">
                    <Terminal className="w-10 h-10 text-[var(--primary-blue)]" />
                    <h1 className="text-3xl font-bold">Developer</h1>
                </div>
                <p className="text-[var(--foreground-secondary)] mb-10 leading-relaxed">
                    Internal entry points for release history and ops notes. These pages are safe to link from
                    footers for transparency; they do not expose secrets.
                </p>

                <ul className="space-y-4">
                    <li>
                        <Link
                            href="/dev/version"
                            className="flex items-start gap-4 rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] p-5 hover:border-[var(--primary-blue)]/50 transition-colors group"
                        >
                            <BookMarked className="w-6 h-6 text-[var(--primary-blue)] shrink-0 mt-0.5" />
                            <div>
                                <h2 className="font-semibold group-hover:text-[var(--primary-blue)]">
                                    Version history
                                </h2>
                                <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                                    Changelog and per-release notes (v2.1.0, v2.0.1, …).
                                </p>
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/"
                            className="flex items-start gap-4 rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] p-5 hover:border-[var(--primary-blue)]/50 transition-colors group"
                        >
                            <Home className="w-6 h-6 text-[var(--foreground-secondary)] shrink-0 mt-0.5" />
                            <div>
                                <h2 className="font-semibold group-hover:text-[var(--primary-blue)]">
                                    Marketing home
                                </h2>
                                <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                                    Return to the public landing experience.
                                </p>
                            </div>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}
