'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { ArrowUpRight, Briefcase, ClipboardList, Search, Users, Wrench } from 'lucide-react';

function EmployerDashboardContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const dashboard = params.dashboard as string;
    const base = `/app/org/employer/${dashboard}`;

    useEffect(() => {
        const redirectTarget = searchParams.get('redirectTarget');
        if (redirectTarget === 'tools') {
            router.push(`${base}/tools`);
        }
    }, [searchParams, base, router]);

    const tiles = [
        {
            title: 'Job postings',
            desc: 'Ship polished listings, keep drafts synced with sourcing partners, tune requirements.',
            href: `${base}/jobs`,
            icon: Briefcase,
        },
        {
            title: 'Applicants & rankings',
            desc: 'Open any role to inspect applicants, funnel states, and AI-assisted ordering.',
            href: `${base}/jobs`,
            icon: ClipboardList,
            footnote: 'Pick a posted job → Applicants',
        },
        {
            title: 'Talent sourcing',
            desc: 'Search recruiter and candidate profiles tied to your hiring programs.',
            href: `${base}/sourcing`,
            icon: Search,
        },
        {
            title: 'Team roster',
            desc: 'Keep hiring teammates aligned on ownership and notifications.',
            href: `${base}/team`,
            icon: Users,
        },
        {
            title: 'Employer AI tools',
            desc: 'Job narratives, interviewer scripts, and offer scaffolding in one pane.',
            href: `${base}/tools`,
            icon: Wrench,
        },
    ];

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-4 md:px-8">
            <div className="section py-12 max-w-6xl mx-auto">
                <p className="text-xs uppercase tracking-wide text-[var(--primary-blue)] font-semibold mb-2">
                    Employer cockpit
                </p>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Hiring, without the swirl</h1>
                <p className="text-xl text-[var(--foreground-secondary)] mb-12 max-w-3xl leading-relaxed">
                    Every link below maps to a working surface—skip the placeholders and jump straight
                    into postings, collaborator tools, or AI-assisted workflows.
                </p>

                <div className="grid sm:grid-cols-2 gap-5">
                    {tiles.map((tile) => (
                        <Link
                            key={`${tile.href}-${tile.title}`}
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
                            <p className="text-[var(--foreground-secondary)] text-sm leading-relaxed mb-1">
                                {tile.desc}
                            </p>
                            {tile.footnote && (
                                <p className="text-xs text-[var(--primary-blue)]">{tile.footnote}</p>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function EmployerDashboard() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center text-[var(--foreground-secondary)]">
                    Loading dashboard…
                </div>
            }
        >
            <EmployerDashboardContent />
        </Suspense>
    );
}
