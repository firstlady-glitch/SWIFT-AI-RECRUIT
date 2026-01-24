'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import {
    Building2, MapPin, DollarSign, Briefcase, Calendar,
    ArrowLeft, FileText, X, Upload, ExternalLink, MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface JobDetails {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    location: string | null;
    type: string | null;
    salary_range_min: number | null;
    salary_range_max: number | null;
    created_at: string;
    application_type: 'internal' | 'external';
    external_apply_url: string | null;
    organization: { id: string; name: string; logo_url: string | null; description: string | null; created_by: string };
}

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;
    // params.dashboard is undefined here since we are not in a [dashboard] route
    const [dashboardId, setDashboardId] = useState<string | null>(null);

    const [job, setJob] = useState<JobDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [hasApplied, setHasApplied] = useState(false);
    const [userResume, setUserResume] = useState<string | null>(null);

    useEffect(() => {
        fetchCurrentUser();
        fetchJobDetails();
        checkApplicationStatus();
        fetchUserResume();
    }, [jobId]);

    const fetchCurrentUser = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single();
            if (profile) setDashboardId(profile.id);
        }
    };

    const fetchJobDetails = async () => {
        const supabase = createClient();
        setIsLoading(true);

        try {
            const { data, error } = await supabase
                .from('jobs')
                .select(`
                    id,
                    title,
                    description,
                    requirements,
                    location,
                    type,
                    salary_range_min,
                    salary_range_max,
                    created_at,
                    application_type,
                    external_apply_url,
                    external_apply_url,
                    organization:organizations(id, name, logo_url, description, created_by)
                `)
                .eq('id', jobId)
                .single();

            if (error) throw error;

            const transformed = {
                ...data,
                organization: Array.isArray(data.organization) ? data.organization[0] : data.organization
            };

            setJob(transformed as JobDetails);
            console.log('[JobDetails] Loaded job:', transformed.title);

        } catch (err: any) {
            console.error('[JobDetails] Error:', err);
            setError('Failed to load job details.');
        } finally {
            setIsLoading(false);
        }
    };

    const checkApplicationStatus = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', jobId)
            .eq('applicant_id', user.id)
            .single();

        setHasApplied(!!data);
    };

    const fetchUserResume = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('profiles')
            .select('resume_url')
            .eq('id', user.id)
            .single();

        setUserResume(data?.resume_url || null);
    };

    const handleExternalClick = async () => {
        // Track the click
        try {
            await fetch(`/api/jobs/${jobId}/click`, { method: 'POST' });
            console.log('[JobDetails] Tracked external link click');
        } catch (err) {
            console.error('[JobDetails] Failed to track click:', err);
        }
    };

    const handleApply = async () => {
        if (!userResume) {
            alert('Please upload a resume in your profile before applying.');
            return;
        }

        setIsApplying(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('applications')
                .insert({
                    job_id: jobId,
                    applicant_id: user.id,
                    cover_letter: coverLetter,
                    resume_version_url: userResume,
                    status: 'applied'
                });

            if (error) throw error;

            console.log('[JobDetails] Application submitted for job:', jobId);
            setHasApplied(true);
            setShowApplyModal(false);
            alert('Application submitted successfully!');

        } catch (err: any) {
            console.error('[JobDetails] Apply error:', err);
            alert('Failed to submit application. Please try again.');
        } finally {
            setIsApplying(false);
        }
    };

    const handleMessage = async () => {
        if (!job?.organization?.created_by) return;

        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId: job.organization.created_by })
            });

            if (!res.ok) throw new Error('Failed to start conversation');

            if (!dashboardId) {
                alert('Please log in to message');
                return;
            }
            router.push(`/app/applicant/${dashboardId}/messages`);
        } catch (err) {
            console.error('Error starting conversation:', err);
            alert('Failed to start conversation');
        }
    };

    if (error) return <div className="p-8"><ErrorState message={error} /></div>;
    if (isLoading || !job) return <div className="p-8"><LoadingState type="card" count={1} className="h-96" /></div>;

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/app/applicant/jobs"
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Jobs
                </Link>

                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8 mb-6">
                    <div className="flex items-start gap-6 mb-6">
                        {job.organization?.logo_url ? (
                            <img
                                src={job.organization.logo_url}
                                alt={job.organization.name}
                                className="w-20 h-20 rounded-lg object-cover"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-lg bg-gray-800 flex items-center justify-center">
                                <Building2 className="w-10 h-10 text-gray-500" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                            <Link
                                href={dashboardId ? `/app/applicant/${dashboardId}/profile/${job.organization?.id}` : '#'}
                                className="text-xl text-gray-400 mb-4 hover:text-[var(--primary-blue)] transition-colors block w-fit"
                            >
                                {job.organization?.name}
                            </Link>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {job.location || 'Remote'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    {job.type || 'Full-time'}
                                </div>
                                {(job.salary_range_min || job.salary_range_max) && (
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        {job.salary_range_min && `$${(job.salary_range_min / 1000).toFixed(0)}k`}
                                        {job.salary_range_max && ` - $${(job.salary_range_max / 1000).toFixed(0)}k`}
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Posted {new Date(job.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {job.application_type === 'external' && job.external_apply_url ? (
                            <a
                                href={job.external_apply_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleExternalClick}
                                className="btn btn-primary px-8 py-3 flex items-center gap-2"
                            >
                                Apply Now
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        ) : (
                            <button
                                onClick={() => setShowApplyModal(true)}
                                disabled={hasApplied}
                                className={`btn px-8 py-3 ${hasApplied ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'btn-primary'}`}
                            >
                                {hasApplied ? 'Already Applied' : 'Apply Now'}
                            </button>
                        )}
                        <button
                            onClick={handleMessage}
                            className="btn bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--background-secondary)] px-4 py-3 text-gray-400 hover:text-white"
                            title="Message Employer"
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8 mb-6">
                    <h2 className="text-xl font-bold mb-4">Job Description</h2>
                    <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                        {job.description}
                    </div>
                </div>

                {job.requirements && job.requirements.length > 0 && (
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8">
                        <h2 className="text-xl font-bold mb-4">Requirements</h2>
                        <ul className="space-y-2">
                            {job.requirements.map((req, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-gray-300">
                                    <span className="text-[var(--primary-blue)] mt-1">•</span>
                                    {req}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Apply Modal */}
                {showApplyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl max-w-2xl w-full p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold">Apply for {job.title}</h3>
                                <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {!userResume ? (
                                <div className="text-center py-8">
                                    <FileText className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                    <p className="text-gray-400 mb-4">You need to upload a resume before applying.</p>
                                    <Link href="/app/applicant/dashboard" className="btn btn-primary">
                                        Go to Profile Settings
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium mb-2">Cover Letter (Optional)</label>
                                        <textarea
                                            value={coverLetter}
                                            onChange={(e) => setCoverLetter(e.target.value)}
                                            placeholder="Tell the employer why you're a great fit..."
                                            className="w-full h-40 bg-[#0b0c0f] border border-gray-800 rounded-lg p-4 focus:border-[var(--primary-blue)] focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-4">
                                        <button
                                            onClick={() => setShowApplyModal(false)}
                                            className="btn border border-gray-700 hover:bg-gray-800 px-6 py-3"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleApply}
                                            disabled={isApplying}
                                            className="btn btn-primary px-8 py-3"
                                        >
                                            {isApplying ? 'Submitting...' : 'Submit Application'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
