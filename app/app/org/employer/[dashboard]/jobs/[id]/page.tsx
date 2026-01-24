'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { KanbanBoard } from '@/components/ui/KanbanBoard';
import { ArrowLeft, Edit, Trash2, Globe, EyeOff, MoreVertical } from 'lucide-react';
import Link from 'next/link';

interface Application {
    id: string;
    status: string;
    score?: number;
    title: string;
    applicant: {
        full_name: string;
        email: string;
        profile_image_url: string | null;
    };
}

const STAGES = ['applied', 'reviewed', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'];

export default function JobATSPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;
    const dashboard = params.dashboard as string;

    const [job, setJob] = useState<any>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showActions, setShowActions] = useState(false);

    useEffect(() => {
        fetchJobAndApplications();
    }, [jobId]);

    const fetchJobAndApplications = async () => {
        const supabase = createClient();
        setIsLoading(true);

        try {
            const { data: jobData, error: jobError } = await supabase
                .from('jobs')
                .select('id, title, status')
                .eq('id', jobId)
                .single();

            if (jobError) throw jobError;
            setJob(jobData);

            const { data, error } = await supabase
                .from('applications')
                .select(`
                    id,
                    status,
                    score,
                    applicant:profiles!applicant_id (
                        full_name,
                        email,
                        profile_image_url
                    )
                `)
                .eq('job_id', jobId)
                .order('score', { ascending: false, nullsFirst: false });

            if (error) throw error;

            const transformed = (data || []).map(app => {
                const applicant = Array.isArray(app.applicant) ? app.applicant[0] : app.applicant;
                return {
                    ...app,
                    title: applicant?.full_name || 'Unknown',
                    score: app.score ?? undefined,
                    applicant
                };
            });

            setApplications(transformed);
            console.log('[JobATS] Loaded', transformed.length, 'applications');

        } catch (err: any) {
            console.error('[JobATS] Error:', err);
            setError('Failed to load applications.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (applicationId: string, newStatus: string) => {
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from('applications')
                .update({ status: newStatus })
                .eq('id', applicationId);

            if (error) throw error;

            setApplications(prev =>
                prev.map(app =>
                    app.id === applicationId ? { ...app, status: newStatus } : app
                )
            );

            console.log('[JobATS] Updated application', applicationId, 'to', newStatus);

        } catch (err: any) {
            console.error('[JobATS] Update error:', err);
            alert('Failed to update status');
        }
    };

    const handleTogglePublish = async () => {
        setIsUpdating(true);
        const newStatus = job.status === 'published' ? 'draft' : 'published';
        try {
            const res = await fetch(`/api/jobs/${jobId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error('Failed to update status');
            setJob((prev: any) => ({ ...prev, status: newStatus }));
            console.log('[JobATS] Updated job status to:', newStatus);
        } catch (err) {
            console.error('[JobATS] Status update error:', err);
            alert('Failed to update job status');
        } finally {
            setIsUpdating(false);
            setShowActions(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this job? This cannot be undone.')) return;
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete');
            }
            console.log('[JobATS] Deleted job:', jobId);
            router.push(`/app/org/employer/${dashboard}/jobs`);
        } catch (err: any) {
            console.error('[JobATS] Delete error:', err);
            alert(err.message || 'Failed to delete job');
        } finally {
            setIsUpdating(false);
        }
    };

    if (error) return <div className="p-8"><ErrorState message={error} /></div>;
    if (isLoading || !job) return <div className="p-8"><LoadingState type="card" count={1} className="h-96" /></div>;

    const columns = STAGES.map(stage => ({
        id: stage,
        title: stage.charAt(0).toUpperCase() + stage.slice(1),
        items: applications.filter(app => app.status === stage),
        color: 'blue'
    }));

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-7xl mx-auto">
                <Link
                    href={`/app/org/employer/${dashboard}/jobs`}
                    className="inline-flex items-center text-[var(--foreground-secondary)] hover:text-[var(--foreground)] mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Jobs
                </Link>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{job.title}</h1>
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${job.status === 'published' ? 'bg-green-500/20 text-green-400' :
                                job.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-gray-500/20 text-gray-400'
                                }`}>
                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </span>
                        </div>
                        <p className="text-[var(--foreground-secondary)] mt-1">{applications.length} total applicants</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={`/app/org/employer/${dashboard}/jobs/${jobId}/edit`}
                            className="btn border border-gray-700 hover:bg-gray-800 px-4 py-2 flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </Link>

                        <button
                            onClick={handleTogglePublish}
                            disabled={isUpdating}
                            className={`btn px-4 py-2 flex items-center gap-2 ${job.status === 'published'
                                ? 'border border-gray-700 hover:bg-gray-800'
                                : 'btn-primary'
                                }`}
                        >
                            {job.status === 'published' ? (
                                <><EyeOff className="w-4 h-4" /> Unpublish</>
                            ) : (
                                <><Globe className="w-4 h-4" /> Publish</>
                            )}
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowActions(!showActions)}
                                className="p-2 border border-gray-700 hover:bg-gray-800 rounded-lg"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>
                            {showActions && (
                                <div className="absolute right-0 top-12 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg py-1 min-w-[150px] shadow-xl z-10">
                                    <button
                                        onClick={handleDelete}
                                        disabled={isUpdating || job.status !== 'draft'}
                                        className="w-full px-4 py-2 text-left text-red-400 hover:bg-[var(--border)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Job
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <KanbanBoard
                    columns={columns}
                    onCardMove={handleStatusChange}
                    renderCard={(item) => {
                        const app = applications.find(a => a.id === item.id);
                        return (
                            <Link
                                href={`/app/org/employer/${dashboard}/candidates/${item.id}`}
                                className="block bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--primary-blue)] transition-colors"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    {app?.applicant?.profile_image_url ? (
                                        <img
                                            src={app.applicant.profile_image_url}
                                            alt={app.applicant.full_name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-800" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-[var(--foreground)] truncate">
                                            {app?.applicant?.full_name || 'Unknown'}
                                        </div>
                                        <div className="text-xs text-[var(--foreground-secondary)] truncate">
                                            {app?.applicant?.email}
                                        </div>
                                    </div>
                                </div>
                                {item.score !== undefined && (
                                    <div className={`text-sm font-bold ${item.score >= 80 ? 'text-green-400' : 'text-gray-400'}`}>
                                        Match: {item.score}%
                                    </div>
                                )}
                            </Link>
                        );
                    }}
                />
            </div>
        </div>
    );
}
