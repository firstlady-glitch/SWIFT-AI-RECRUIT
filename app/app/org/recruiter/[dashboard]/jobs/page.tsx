'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import {
    Plus,
    Briefcase,
    MapPin,
    Clock,
    ExternalLink,
    Users,
} from 'lucide-react';

interface Job {
    id: string;
    title: string;
    location: string | null;
    type: string;
    status: string;
    application_type: 'internal' | 'external';
    created_at: string;
    applications?: { count: number }[];
}

export default function RecruiterJobsPage() {
    const params = useParams();
    const dashboard = params.dashboard as string;
    const base = `/app/org/recruiter/${dashboard}/jobs`;
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setIsLoading(true);
        const supabase = createClient();

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!profile?.organization_id) {
                setJobs([]);
                setIsLoading(false);
                return;
            }

            const { data, error: fetchError } = await supabase
                .from('jobs')
                .select(
                    'id, title, location, type, status, application_type, created_at, applications(count)'
                )
                .eq('organization_id', profile.organization_id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setJobs((data as Job[]) || []);
        } catch (err: unknown) {
            console.error('[Jobs]', err);
            const msg =
                err instanceof Error ? err.message : 'Failed to load jobs';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const applicantCount = (job: Job) =>
        job.applications?.[0]?.count ?? 0;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return 'text-green-400 bg-green-500/10';
            case 'draft':
                return 'text-yellow-400 bg-yellow-500/10';
            case 'closed':
                return 'text-gray-400 bg-gray-500/10';
            default:
                return 'text-gray-400 bg-gray-500/10';
        }
    };

    if (isLoading)
        return <LoadingState type="card" count={4} />;
    if (error) return <ErrorState message={error} onRetry={fetchJobs} />;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)] p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-[var(--primary-blue)] font-semibold mb-2">
                            Hiring pipeline
                        </p>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Jobs</h1>
                        <p className="text-[var(--foreground-secondary)] max-w-xl">
                            Draft privately, iterate with AI tooling, publish when stakeholders sign
                            off. Applicant totals refresh with every submission.
                        </p>
                    </div>
                    <Link
                        href={`${base}/create`}
                        className="btn btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        Post new job
                    </Link>
                </div>

                {jobs.length === 0 ? (
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-secondary)] p-14 text-center">
                        <Briefcase className="w-12 h-12 mx-auto text-[var(--foreground-secondary)] mb-4" />
                        <h3 className="text-xl font-bold mb-2">No roles yet</h3>
                        <p className="text-[var(--foreground-secondary)] mb-8">
                            Spin up your first posting—draft stays internal until you mark it live.
                        </p>
                        <Link
                            href={`${base}/create`}
                            className="btn btn-primary inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create a job draft
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {jobs.map((job) => (
                            <Link
                                key={job.id}
                                href={`${base}/${job.id}`}
                                className="rounded-2xl border border-[var(--border)] bg-[var(--background-secondary)] p-6 hover:border-[var(--primary-blue)]/35 transition-colors"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="min-w-[200px] flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold">{job.title}</h3>
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-medium ${getStatusColor(job.status)}`}
                                            >
                                                {job.status.charAt(0).toUpperCase() +
                                                    job.status.slice(1)}
                                            </span>
                                            {job.application_type === 'external' && (
                                                <span className="flex items-center gap-1 text-xs text-blue-400">
                                                    <ExternalLink className="w-3 h-3" />
                                                    External board
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--foreground-secondary)]">
                                            {job.location && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="w-4 h-4 shrink-0" />
                                                    {job.location}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1">
                                                <Briefcase className="w-4 h-4 shrink-0" />
                                                {job.type}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="w-4 h-4 shrink-0" />
                                                {new Date(job.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] whitespace-nowrap">
                                        <Users className="w-4 h-4 text-[var(--primary-blue)]" />
                                        {applicantCount(job)} applicant
                                        {applicantCount(job) === 1 ? '' : 's'}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
