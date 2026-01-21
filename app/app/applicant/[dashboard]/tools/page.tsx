'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FileText, MessageSquare, Sparkles, PenTool, Target } from 'lucide-react';

const tools = [
    {
        name: 'Smart Resume Parser',
        description: 'Extract profile data from your resume with AI. Use existing resume or paste new.',
        icon: FileText,
        href: 'resume-parser',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10'
    },
    {
        name: 'Resume Optimizer',
        description: 'Get AI feedback to improve your resume with ATS scoring and keyword analysis.',
        icon: Sparkles,
        href: 'resume-optimizer',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10'
    },
    {
        name: 'Cover Letter Generator',
        description: 'Write personalized cover letters tailored to specific job postings.',
        icon: PenTool,
        href: 'cover-letter',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
    },
    {
        name: 'Interview Prep AI',
        description: 'Practice with AI-generated interview questions with hints and progress tracking.',
        icon: MessageSquare,
        href: 'interview-prep',
        color: 'text-pink-500',
        bgColor: 'bg-pink-500/10'
    },
    {
        name: 'Job Fit Predictor',
        description: 'Compare your profile against jobs to see match score and skill gaps.',
        icon: Target,
        href: 'job-fit',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10'
    }
];

export default function ApplicantToolsPage() {
    const params = useParams();

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">AI Tools</h1>
                <p className="text-gray-400 mb-8">Supercharge your job search with intelligent tools.</p>

                <div className="grid md:grid-cols-2 gap-6">
                    {tools.map((tool) => (
                        <Link
                            key={tool.name}
                            href={`/app/applicant/${params.dashboard}/tools/${tool.href}`}
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
