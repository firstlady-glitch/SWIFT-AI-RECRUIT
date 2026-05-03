'use client';

import { useParams } from 'next/navigation';
import { Mail, Search, TrendingUp, Presentation, Code } from 'lucide-react';

import ToolsHub, { type ToolHubItem } from '@/components/dashboard/ToolsHub';

const tools: ToolHubItem[] = [
    {
        slug: 'outreach-email',
        name: 'Outreach Email Generator',
        description:
            'Turn role context and highlights into concise, respectful candidate outreach tailored to tone and locale.',
        icon: Mail,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/15',
    },
    {
        slug: 'semantic-search',
        name: 'Semantic Candidate Search',
        description:
            'Describe the ideal hire in plain language and get transferable search snippets and qualifiers.',
        icon: Search,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/15',
    },
    {
        slug: 'boolean-search',
        name: 'Boolean Search Builder',
        description:
            'Generate tight boolean strings for LinkedIn, GitHub, and general web sourcing.',
        icon: Code,
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-500/15',
    },
    {
        slug: 'candidate-pitch',
        name: 'Candidate Pitch Writer',
        description:
            'Package a prospect into an executive-ready summary aligned to stakeholder priorities.',
        icon: Presentation,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/15',
    },
    {
        slug: 'pipeline-analytics',
        name: 'Pipeline Signals',
        description:
            'Surface risks, stalled stages, and next actions based on funnel notes you paste in.',
        icon: TrendingUp,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/15',
    },
];

export default function RecruiterToolsPage() {
    const params = useParams();
    const dashboard = params.dashboard as string;

    return (
        <ToolsHub
            title="AI tools for recruiters"
            subtitle="Sharper drafts, tighter searches, cleaner stakeholder updates—all from one workspace."
            tools={tools}
            resolveHref={(slug) =>
                `/app/org/recruiter/${dashboard}/tools/${slug}`
            }
        />
    );
}
