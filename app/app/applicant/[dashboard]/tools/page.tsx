'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FileText, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';

export default function ApplicantToolsPage() {
    const params = useParams();
    const dashboardId = params.dashboard;

    const tools = [
        {
            name: "Cover Letter Writer",
            desc: "Instantly write tailored cover letters for any job.",
            icon: <FileText className="w-8 h-8 text-[var(--primary-blue)]" />,
            href: `/app/applicant/${dashboardId}/tools/cover-letter`,
            color: "bg-[var(--primary-blue)]/10"
        },
        {
            name: "Resume Optimizer",
            desc: "Get expert feedback on your resume content.",
            icon: <Sparkles className="w-8 h-8 text-purple-500" />,
            href: `/app/applicant/${dashboardId}/tools/resume-optimizer`,
            color: "bg-purple-500/10"
        },
        {
            name: "Interview Prep",
            desc: "Practice with custom interview questions.",
            icon: <MessageSquare className="w-8 h-8 text-pink-500" />,
            href: `/app/applicant/${dashboardId}/tools/interview-prep`,
            color: "bg-pink-500/10"
        }
    ];

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-2">Job Seeker Tools</h1>
            <p className="text-[var(--foreground-secondary)] mb-8">AI-powered tools to accelerate your career.</p>

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
