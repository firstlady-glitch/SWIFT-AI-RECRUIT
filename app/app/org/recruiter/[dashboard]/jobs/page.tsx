'use client';

// over here add a badge of applicants count for each listed job 

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Plus, Briefcase, MapPin, Clock, ExternalLink, FileText } from 'lucide-react';

interface Job {
    id: string;
    title: string;
    location: string | null;
    type: string;
    status: string;
    application_type: 'internal' | 'external';
    created_at: string;
}

export default function RecruiterJobsPage() {
    const params = useParams();
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
            const { data: { user } } = await supabase.auth.getUser();
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

            const { data, error } = await supabase
                .from('jobs')
                .select('id, title, location, type, status, application_type, created_at')
                .eq('organization_id', profile.organization_id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setJobs(data || []);
        } catch (err: any) {
            console.error('[Jobs] Error:', err);
            setError(err.message || 'Failed to load jobs');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'text-green-400 bg-green-500/10';
            case 'draft': return 'text-yellow-400 bg-yellow-500/10';
            case 'closed': return 'text-gray-400 bg-gray-500/10';
            default: return 'text-gray-400 bg-gray-500/10';
        }
    };

    if (isLoading) return <LoadingState type="card" count={4} />;
    if (error) return <ErrorState message={error} onRetry={fetchJobs} />;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Jobs</h1>
                    <p className="text-gray-400">Manage your job postings and track applications.</p>
                </div>
                <Link
                    href={`/app/org/recruiter/${params.dashboard}/jobs/create`}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Post New Job
                </Link>
            </div>

            {jobs.length === 0 ? (
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-12 text-center">
                    <Briefcase className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Jobs Posted Yet</h3>
                    <p className="text-gray-400 mb-6">Create your first job posting to start receiving applications.</p>
                    <Link
                        href={`/app/org/recruiter/${params.dashboard}/jobs/create`}
                        className="btn btn-primary inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Your First Job
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {jobs.map((job) => (
                        <Link
                            key={job.id}
                            href={`/app/org/recruiter/${params.dashboard}/jobs/${job.id}`}
                            className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 hover:border-gray-700 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold">{job.title}</h3>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(job.status)}`}>
                                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                        </span>
                                        {job.application_type === 'external' && (
                                            <span className="flex items-center gap-1 text-xs text-blue-400">
                                                <ExternalLink className="w-3 h-3" />
                                                External
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        {job.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {job.location}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Briefcase className="w-4 h-4" />
                                            {job.type}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
