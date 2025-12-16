'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Mail, Presentation, Search, ArrowRight } from 'lucide-react';

export default function RecruiterToolsPage() {
    const params = useParams();
    const dashboardId = params.dashboard;

    const tools = [
        {
            name: "Outreach Email Generator",
            desc: "Draft hyper-personalized cold emails.",
            icon: <Mail className="w-8 h-8 text-blue-500" />,
            href: `/app/org/recruiter/${dashboardId}/tools/outreach-email`,
            color: "bg-blue-500/10"
        },
        {
            name: "Candidate Pitch Generator",
            desc: "Pitch candidates to clients compellingly.",
            icon: <Presentation className="w-8 h-8 text-orange-500" />,
            href: `/app/org/recruiter/${dashboardId}/tools/candidate-pitch`,
            color: "bg-orange-500/10"
        },
        {
            name: "Boolean Search Helper",
            desc: "Generate complex X-ray search strings.",
            icon: <Search className="w-8 h-8 text-indigo-500" />,
            href: `/app/org/recruiter/${dashboardId}/tools/boolean-search`,
            color: "bg-indigo-500/10"
        }
    ];

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-2">Recruiter Tools</h1>
            <p className="text-[var(--foreground-secondary)] mb-8">Supercharge your sourcing and placements.</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool, idx) => (
                    <Link
                        key={idx}
                        href={tool.href}
                        className="card p-6 border border-gray-800 bg-[#15171e] hover:border-[var(--primary-blue)] transition-all group"
                    >
                        <div className={`w-16 h-16 rounded-2xl ${tool.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            {tool.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                        <p className="text-[var(--foreground-secondary)] mb-6 text-sm">{tool.desc}</p>

                        <div className="flex items-center text-[var(--primary-blue)] font-medium text-sm">
                            Open Tool <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
