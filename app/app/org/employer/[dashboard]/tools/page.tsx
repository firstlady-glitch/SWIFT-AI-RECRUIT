'use client';

import { useParams } from 'next/navigation';
import { FileText, MessageSquare, UserCheck, Brain, FileCheck } from 'lucide-react';

import ToolsHub, { type ToolHubItem } from '@/components/dashboard/ToolsHub';

const tools: ToolHubItem[] = [
    {
        slug: 'job-description',
        name: 'Job Description Generator',
        description:
            'Generate inclusive job posts with headline, responsibilities, compensation bands, and must-have skills.',
        icon: FileText,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/15',
    },
    {
        slug: 'candidate-ranking',
        name: 'Candidate Ranking Planner',
        description:
            'Turn requirements and resumes into comparative notes, score rubrics, and follow-up probes.',
        icon: UserCheck,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/15',
    },
    {
        slug: 'interview-script',
        name: 'Interview Script Composer',
        description:
            'Structure interview arcs with warm-ups, competency blocks, scoring guides, and timeboxes.',
        icon: MessageSquare,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/15',
    },
    {
        slug: 'interview-intelligence',
        name: 'Interview Intelligence',
        description:
            'Summarize recordings or notes into verdicts, risk flags, and suggested decision memos.',
        icon: Brain,
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/15',
    },
    {
        slug: 'offer-letter',
        name: 'Offer Letter Assistant',
        description:
            'Draft professional offer scaffolding with placeholders for payroll, perks, legal review, and start date.',
        icon: FileCheck,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/15',
    },
];

export default function EmployerToolsPage() {
    const params = useParams();
    const dashboard = params.dashboard as string;

    return (
        <ToolsHub
            title="Employer workspace tools"
            subtitle="Go from job post to structured interviews and offers faster—everything routes through SwiftAI safeguards."
            tools={tools}
            resolveHref={(slug) =>
                `/app/org/employer/${dashboard}/tools/${slug}`
            }
        />
    );
}
