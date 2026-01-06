'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { KanbanBoard } from '@/components/ui/KanbanBoard';
import { ArrowLeft } from 'lucide-react';
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
    const jobId = params.id as string;

    const [job, setJob] = useState<any>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                    href="/app/org/employer/jobs"
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Jobs
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">{job.title} - Applicant Pipeline</h1>
                    <p className="text-gray-400">{applications.length} total applicants</p>
                </div>

                <KanbanBoard
                    columns={columns}
                    onCardMove={handleStatusChange}
                    renderCard={(item) => {
                        const app = applications.find(a => a.id === item.id);
                        return (
                            <Link
                                href={`/app/org/employer/candidates/${item.id}`}
                                className="block bg-[#15171e] border border-gray-800 rounded-lg p-4 hover:border-[var(--primary-blue)] transition-colors"
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
                                        <div className="font-medium text-white truncate">
                                            {app?.applicant?.full_name || 'Unknown'}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
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
