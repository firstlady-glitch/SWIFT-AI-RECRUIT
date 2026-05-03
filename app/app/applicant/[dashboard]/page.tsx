'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import {
    ArrowUpRight,
    Briefcase,
    CalendarDays,
    FileText,
    Wrench,
} from 'lucide-react';

function ApplicantDashboardContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const dashboard = params.dashboard as string;
    const base = `/app/applicant/${dashboard}`;

    useEffect(() => {
        const redirectTarget = searchParams.get('redirectTarget');
        if (redirectTarget === 'tools') {
            router.push(`${base}/tools`);
        }
    }, [searchParams, base, router]);

    const tiles = [
        {
            title: 'Discover roles',
            desc: 'Search curated postings and tailor applications with contextual AI.',
            href: '/app/applicant/jobs',
            icon: Briefcase,
        },
        {
            title: 'Applications inbox',
            desc: 'Track submissions, statuses, and follow-ups without losing momentum.',
            href: `${base}/applications`,
            icon: FileText,
        },
        {
            title: 'Interview calendar',
            desc: 'Prep for booked conversations and revisit AI-generated rehearsal notes.',
            href: `${base}/interviews`,
            icon: CalendarDays,
        },
        {
            title: 'Applicant AI kit',
            desc: 'Resume tuning, storytelling, scenario prep—all powered by Groq here.',
            href: `${base}/tools`,
            icon: Wrench,
        },
    ];

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)]">
            <div className="section py-12 max-w-6xl mx-auto px-4 md:px-8">
                <p className="text-xs uppercase tracking-wide text-[var(--primary-blue)] font-semibold mb-2">
                    Candidate home
                </p>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Your search, orchestrated</h1>
                <p className="text-xl text-[var(--foreground-secondary)] mb-12 max-w-3xl leading-relaxed">
                    Navigate between marketplace roles, staged applications, and AI copilots that keep
                    your story consistent from resume to onsite.
                </p>

                <div className="grid sm:grid-cols-2 gap-5">
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

export default function ApplicantDashboard() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center text-[var(--foreground-secondary)]">
                    Loading dashboard…
                </div>
            }
        >
            <ApplicantDashboardContent />
        </Suspense>
    );
}
