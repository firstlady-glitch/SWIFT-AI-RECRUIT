'use client';

import { useParams } from 'next/navigation';
import { FileText, MessageSquare, Sparkles, PenTool, Target } from 'lucide-react';

import ToolsHub, { type ToolHubItem } from '@/components/dashboard/ToolsHub';

const tools: ToolHubItem[] = [
    {
        slug: 'resume-parser',
        name: 'Smart Resume Parser',
        description:
            'Normalize messy resumes into clean sections you can tweak before syncing to profiles.',
        icon: FileText,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/15',
    },
    {
        slug: 'resume-optimizer',
        name: 'Resume Optimizer',
        description:
            'Stress-test wording for clarity, ATS alignment, and impact statements against a job description.',
        icon: Sparkles,
        color: 'text-violet-400',
        bgColor: 'bg-violet-500/15',
    },
    {
        slug: 'cover-letter',
        name: 'Cover Letter Studio',
        description:
            'Blend your story with a job post to draft letters that mirror company voice without sounding templated.',
        icon: PenTool,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/15',
    },
    {
        slug: 'interview-prep',
        name: 'Interview Prep Studio',
        description:
            'Generate likely questions by seniority stack, paired with talking points you can rehearse.',
        icon: MessageSquare,
        color: 'text-pink-400',
        bgColor: 'bg-pink-500/15',
    },
    {
        slug: 'job-fit',
        name: 'Job Fit Predictor',
        description:
            'Compare your toolkit to postings to spot transferable skills and honest gaps.',
        icon: Target,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/15',
    },
];

export default function ApplicantToolsPage() {
    const params = useParams();
    const dashboard = params.dashboard as string;

    return (
        <ToolsHub
            title="Applicant growth kit"
            subtitle="Prep every asset before you hit apply—from parsed resumes to interviewer-ready anecdotes."
            tools={tools}
            resolveHref={(slug) => `/app/applicant/${dashboard}/tools/${slug}`}
        />
    );
}
