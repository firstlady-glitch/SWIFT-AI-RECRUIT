'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import {
    ArrowUpRight,
    Briefcase,
    Search,
    Send,
    Store,
    Wrench,
} from 'lucide-react';

function RecruiterDashboardContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const dashboard = params.dashboard as string;
    const base = `/app/org/recruiter/${dashboard}`;

    useEffect(() => {
        const redirectTarget = searchParams.get('redirectTarget');
        if (redirectTarget === 'tools') {
            router.push(`${base}/tools`);
        }
    }, [searchParams, base, router]);

    const tiles = [
        {
            title: 'Job postings',
            desc: 'Create drafts, refine descriptions, publish when hiring managers approve.',
            href: `${base}/jobs`,
            icon: Briefcase,
        },
        {
            title: 'Marketplace roles',
            desc: 'See open client demand and prioritize opportunities that fit your roster.',
            href: `${base}/marketplace`,
            icon: Store,
        },
        {
            title: 'Sourcing workspaces',
            desc: 'Kick off hunts with boolean strings, narratives, and shortlists.',
            href: `${base}/sourcing`,
            icon: Search,
        },
        {
            title: 'Submissions & follow-ups',
            desc: 'Track what you shipped to hiring teams and tidy outstanding tasks.',
            href: `${base}/submissions`,
            icon: Send,
        },
        {
            title: 'AI assistants',
            desc: 'Emails, narratives, pipelines—same Groq-backed copilots you use on jobs.',
            href: `${base}/tools`,
            icon: Wrench,
        },
    ];

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-4 md:px-8">
            <div className="section py-12 max-w-6xl mx-auto">
                <p className="text-xs uppercase tracking-wide text-[var(--primary-blue)] font-semibold mb-2">
                    Recruiting workspace
                </p>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Move candidates from sourcing to submission
                </h1>
                <p className="text-xl text-[var(--foreground-secondary)] mb-12 max-w-3xl leading-relaxed">
                    Keep jobs, pipelines, marketplace signals, and AI drafting in sync so every
                    touchpoint feels intentional—not rushed.
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {tiles.map((tile) => (
                        <Link
                            key={tile.href}
                            href={tile.href}
                            className="group rounded-2xl border border-[var(--border)] bg-[var(--background-secondary)] p-6 hover:border-[var(--primary-blue)]/40 hover:shadow-[0_18px_45px_-18px_rgba(59,130,246,0.35)] transition-all"
                        >
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div className="h-11 w-11 rounded-xl bg-[var(--primary-blue)]/15 text-[var(--primary-blue)] flex items-center justify-center">
                                    <tile.icon className="h-6 w-6" aria-hidden />
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-[var(--foreground-secondary)] group-hover:text-[var(--primary-blue)] transition-colors shrink-0" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{tile.title}</h3>
                            <p className="text-[var(--foreground-secondary)] text-sm leading-relaxed">
                                {tile.desc}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function RecruiterDashboard() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center text-[var(--foreground-secondary)]">
                    Loading dashboard…
                </div>
            }
        >
            <RecruiterDashboardContent />
        </Suspense>
    );
}
