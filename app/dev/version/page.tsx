import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const versions = [
    {
        version: "v1.11.2",
        date: "January 22, 2026",
        tag: "Latest",
        tagColor: "purple",
        summary: "Implemented conditional logic to hide pricing and subscription features via environment variable.",
        href: "/dev/version/v1.11.2"
    },
    {
        version: "v1.11.1",
        date: "January 21, 2026",
        tag: "Patch",
        tagColor: "blue",
        summary: "UI Light Mode fixes and Recruiter Signup flow improvements.",
        href: "/dev/version/v1.11.1"
    },
    {
        version: "v1.11.0",
        date: "January 20, 2026",
        tag: "Feature",
        tagColor: "green",
        summary: "Enhanced EmptyState component with improved styling and flexibility.",
        href: "/dev/version/v1.11.0"
    },
    {
        version: "v0.1.0",
        date: "Initial Release",
        tag: "Foundation",
        tagColor: "blue",
        summary: "Initial release with core application structure, authentication, Stripe integration, AI chatbot, and UI/UX foundation.",
        href: "/dev/version/v0.1.0"
    }
];

export default function VersionPage() {
    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
                <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">Version History</h1>
                <p className="text-[var(--foreground-secondary)] mb-8">Swift AI Recruit changelog and release notes.</p>

                <div className="space-y-4">
                    {versions.map((v) => (
                        <Link
                            key={v.version}
                            href={v.href}
                            className="block bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--primary-blue)] transition-colors group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-semibold text-[var(--foreground)] group-hover:text-[var(--primary-blue)] transition-colors">
                                        {v.version}
                                    </h2>
                                    <span className={`px-3 py-1 bg-${v.tagColor}-500/20 text-${v.tagColor}-400 text-xs rounded-full`}>
                                        {v.tag}
                                    </span>
                                </div>
                                <span className="text-gray-500 text-sm">{v.date}</span>
                            </div>
                            <p className="text-[var(--foreground-secondary)] text-sm">{v.summary}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}