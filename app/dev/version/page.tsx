import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const tagClass: Record<string, string> = {
    green: "bg-green-500/20 text-green-400",
    purple: "bg-purple-500/20 text-purple-400",
    blue: "bg-blue-500/20 text-blue-400",
};

const versions = [
    {
        version: "v2.1.0",
        date: "May 3, 2026",
        tag: "Minor",
        tagColor: "green" as const,
        summary:
            "Groq AI APIs, real contact mailer, canonical blog library, recruiter job edit route, sidebar/nav alignment, Stripe plan key mapping, applicant Career+ checkout.",
        href: "/dev/version/v2.1.0",
    },
    {
        version: "v2.0.1",
        date: "February 25, 2026",
        tag: "Patch",
        tagColor: "purple" as const,
        summary:
            "Fixed hardcoded routing bugs in the Recruiter dashboard leading to 404 errors (Job Creation and Profile navigation).",
        href: "/dev/version/v2.0.1",
    },
    {
        version: "v2.0.0",
        date: "January 24, 2026",
        tag: "Major",
        tagColor: "green" as const,
        summary:
            "Admin Control Center with database-driven site settings, dedicated admin authentication, and maintenance mode.",
        href: "/dev/version/v2.0.0",
    },
    {
        version: "v1.11.2",
        date: "January 22, 2026",
        tag: "Patch",
        tagColor: "purple" as const,
        summary:
            "Implemented conditional logic to hide pricing and subscription features via environment variable.",
        href: "/dev/version/v1.11.2",
    },
    {
        version: "v1.11.1",
        date: "January 21, 2026",
        tag: "Patch",
        tagColor: "blue" as const,
        summary: "UI Light Mode fixes and Recruiter Signup flow improvements.",
        href: "/dev/version/v1.11.1",
    },
    {
        version: "v1.11.0",
        date: "January 20, 2026",
        tag: "Feature",
        tagColor: "green" as const,
        summary: "Enhanced EmptyState component with improved styling and flexibility.",
        href: "/dev/version/v1.11.0",
    },
    {
        version: "v0.1.0",
        date: "Initial Release",
        tag: "Foundation",
        tagColor: "blue" as const,
        summary:
            "Initial release with core application structure, authentication, Stripe integration, AI chatbot, and UI/UX foundation.",
        href: "/dev/version/v0.1.0",
    },
];

export default function VersionPage() {
    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-wrap gap-4 mb-8">
                    <Link
                        href="/dev"
                        className="inline-flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Dev hub
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] transition-colors"
                    >
                        Home
                    </Link>
                </div>
                <h1 className="text-3xl font-bold mb-2 text-[var(--foreground)]">Version History</h1>
                <p className="text-[var(--foreground-secondary)] mb-8">
                    Swift AI Recruit changelog and release notes.
                </p>

                <div className="space-y-4">
                    {versions.map((v) => (
                        <Link
                            key={v.version}
                            href={v.href}
                            className="block bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--primary-blue)] transition-colors group"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="text-xl font-semibold text-[var(--foreground)] group-hover:text-[var(--primary-blue)] transition-colors">
                                        {v.version}
                                    </h2>
                                    <span
                                        className={`px-3 py-1 text-xs rounded-full font-medium ${tagClass[v.tagColor]}`}
                                    >
                                        {v.tag}
                                    </span>
                                </div>
                                <span className="text-[var(--foreground-secondary)] text-sm">{v.date}</span>
                            </div>
                            <p className="text-[var(--foreground-secondary)] text-sm">{v.summary}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
