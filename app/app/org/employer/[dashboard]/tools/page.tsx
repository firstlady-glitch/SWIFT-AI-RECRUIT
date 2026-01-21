'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FileText, MessageSquare, UserCheck, Brain, FileCheck } from 'lucide-react';

const tools = [
    {
        name: 'Job Description Generator',
        description: 'Create compelling job descriptions with AI-suggested salary ranges.',
        icon: FileText,
        href: 'job-description',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
    },
    {
        name: 'Candidate Ranking Engine',
        description: 'AI-powered scoring and ranking of applicants for your open positions.',
        icon: UserCheck,
        href: 'candidate-ranking',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10'
    },
    {
        name: 'Interview Script Generator',
        description: 'Create structured interview scripts with scoring guides by round.',
        icon: MessageSquare,
        href: 'interview-script',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10'
    },
    {
        name: 'Interview Intelligence',
        description: 'Analyze interview transcripts and generate structured feedback.',
        icon: Brain,
        href: 'interview-intelligence',
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500/10'
    },
    {
        name: 'Offer Letter Generator',
        description: 'Create professional offer letters for your top candidates.',
        icon: FileCheck,
        href: 'offer-letter',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10'
    }
];

export default function EmployerToolsPage() {
    const params = useParams();

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">AI Tools</h1>
                <p className="text-gray-400 mb-8">Streamline your hiring process with intelligent tools.</p>

                <div className="grid md:grid-cols-2 gap-6">
                    {tools.map((tool) => (
                        <Link
                            key={tool.name}
                            href={`/app/org/employer/${params.dashboard}/tools/${tool.href}`}
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
