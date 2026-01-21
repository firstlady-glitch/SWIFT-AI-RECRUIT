'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Mail, Search, TrendingUp, Presentation, Code } from 'lucide-react';

const tools = [
    {
        name: 'Outreach Email Generator',
        description: 'Create personalized outreach emails for candidates with profile data.',
        icon: Mail,
        href: 'outreach-email',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
    },
    {
        name: 'Semantic Candidate Search',
        description: 'Find candidates using natural language queries and AI matching.',
        icon: Search,
        href: 'semantic-search',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10'
    },
    {
        name: 'Boolean Search Generator',
        description: 'Generate X-Ray search strings for LinkedIn, Google, and GitHub.',
        icon: Code,
        href: 'boolean-search',
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10'
    },
    {
        name: 'Candidate Pitch Generator',
        description: 'Create compelling pitches to sell candidates to hiring managers.',
        icon: Presentation,
        href: 'candidate-pitch',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10'
    },
    {
        name: 'Pipeline Analytics',
        description: 'Monitor pipeline velocity and detect stalled candidates with AI insights.',
        icon: TrendingUp,
        href: 'pipeline-analytics',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10'
    }
];

export default function RecruiterToolsPage() {
    const params = useParams();

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">AI Tools</h1>
                <p className="text-gray-400 mb-8">Supercharge your recruiting with intelligent tools.</p>

                <div className="grid md:grid-cols-2 gap-6">
                    {tools.map((tool) => (
                        <Link
                            key={tool.name}
                            href={`/app/org/recruiter/${params.dashboard}/tools/${tool.href}`}
                            className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--primary-blue)] transition-all group"
                        >
                            <div className={`p-3 rounded-xl ${tool.bgColor} ${tool.color} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                <tool.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">{tool.name}</h3>
                            <p className="text-gray-400 text-sm">{tool.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
