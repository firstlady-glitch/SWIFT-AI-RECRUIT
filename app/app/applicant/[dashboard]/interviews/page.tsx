'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Calendar, Clock, Video, MapPin, ExternalLink, CalendarDays } from 'lucide-react';
import { StatusBadge } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';

interface Interview {
    id: string;
    scheduled_at: string;
    duration_minutes: number;
    meeting_link: string | null;
    location: string | null;
    status: string;
    application: {
        job: {
            title: string;
            organization: { name: string; logo_url: string | null };
        };
    };
    interviewer: {
        full_name: string;
        job_title: string;
        profile_image_url: string | null;
    } | null;
}

export default function ApplicantInterviewsPage() {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        const supabase = createClient();
        setIsLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('interviews')
                .select(`
                    id,
                    scheduled_at,
                    duration_minutes,
                    meeting_link,
                    location,
                    status,
                    interviewer:profiles!interviewer_id (
                        full_name,
                        job_title,
                        profile_image_url
                    ),
                    application:applications!inner (
                        applicant_id,
                        job:jobs (
                            title,
                            organization:organizations (name, logo_url)
                        )
                    )
                `)
                .eq('application.applicant_id', user.id)
                .gte('scheduled_at', new Date().toISOString())
                .order('scheduled_at', { ascending: true });

            if (error) throw error;

            const transformed = (data || []).map(item => {
                const interviewer = Array.isArray(item.interviewer) ? item.interviewer[0] : item.interviewer;
                const application = Array.isArray(item.application) ? item.application[0] : item.application;
                const job = Array.isArray(application?.job) ? application.job[0] : application?.job;
                const organization = Array.isArray(job?.organization) ? job.organization[0] : job?.organization;

                return {
                    ...item,
                    interviewer,
                    application: {
                        job: {
                            ...job,
                            organization
                        }
                    }
                };
            });

            setInterviews(transformed);
            console.log('[Interviews] Loaded', transformed.length, 'interviews');

        } catch (err: any) {
            console.error('[Interviews] Error:', err);
            setError('Failed to load interviews.');
        } finally {
            setIsLoading(false);
        }
    };

    if (error) return <div className="p-8"><ErrorState message={error} /></div>;

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Interview Hub</h1>
                    <p className="text-gray-400">View and join your upcoming interviews.</p>
                </div>

                {isLoading ? (
                    <LoadingState type="list" count={3} />
                ) : interviews.length === 0 ? (
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl">
                        <EmptyState
                            icon={CalendarDays}
                            title="No Interviews Scheduled"
                            description="You don't have any upcoming interviews at the moment. Keep applying to jobs!"
                            actionLabel="Browse Jobs"
                            actionHref="/app/applicant/jobs"
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {interviews.map((interview) => (
                            <div
                                key={interview.id}
                                className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--primary-blue)] transition-all hover:shadow-lg hover:shadow-blue-500/10"
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Date Box */}
                                    <div className="flex-shrink-0 bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-center min-w-[100px] flex flex-col justify-center items-center">
                                        <div className="text-sm text-[var(--primary-blue)] font-bold uppercase">
                                            {new Date(interview.scheduled_at).toLocaleString('default', { month: 'short' })}
                                        </div>
                                        <div className="text-3xl font-bold text-[var(--foreground)] mb-1">
                                            {new Date(interview.scheduled_at).getDate()}
                                        </div>
                                        <div className="text-xs text-[var(--foreground-secondary)]">
                                            {new Date(interview.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">
                                                    {interview.application.job.title}
                                                </h3>
                                                <div className="text-sm text-gray-400 mb-3">
                                                    with {interview.application.job.organization.name}
                                                </div>
                                            </div>
                                            <StatusBadge status={interview.status} variant="interview" />
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-6">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                {interview.duration_minutes} min
                                            </div>
                                            {interview.location ? (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-500" />
                                                    {interview.location}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Video className="w-4 h-4 text-gray-500" />
                                                    Remote Video
                                                </div>
                                            )}
                                        </div>

                                        {/* Interviewer & Action */}
                                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                                            {interview.interviewer ? (
                                                <div className="flex items-center gap-3">
                                                    {interview.interviewer.profile_image_url ? (
                                                        <img
                                                            src={interview.interviewer.profile_image_url}
                                                            className="w-8 h-8 rounded-full"
                                                            alt={interview.interviewer.full_name}
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-[var(--background)] border border-[var(--border)]" />
                                                    )}
                                                    <div className="text-sm">
                                                        <div className="font-medium">{interview.interviewer.full_name}</div>
                                                        <div className="text-xs text-gray-500">{interview.interviewer.job_title}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">Interviewer TBD</span>
                                            )}

                                            {interview.meeting_link && (
                                                <a
                                                    href={interview.meeting_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-primary px-4 py-2 text-sm flex items-center gap-2"
                                                >
                                                    Join Meeting
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
