import Link from "next/link";

const versions = [
    {
        version: "v1.11.0",
        date: "January 2026",
        tag: "Latest",
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
                <h1 className="text-3xl font-bold mb-2">Version History</h1>
                <p className="text-gray-400 mb-8">Swift AI Recruit changelog and release notes.</p>

                <div className="space-y-4">
                    {versions.map((v) => (
                        <Link
                            key={v.version}
                            href={v.href}
                            className="block bg-[#15171e] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">
                                        {v.version}
                                    </h2>
                                    <span className={`px-3 py-1 bg-${v.tagColor}-500/20 text-${v.tagColor}-400 text-xs rounded-full`}>
                                        {v.tag}
                                    </span>
                                </div>
                                <span className="text-gray-500 text-sm">{v.date}</span>
                            </div>
                            <p className="text-gray-400 text-sm">{v.summary}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}