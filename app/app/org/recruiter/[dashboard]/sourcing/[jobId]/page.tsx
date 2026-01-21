'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Send,
    User,
    Briefcase,
    Building2,
    MapPin,
    DollarSign,
    Search,
    Check,
    Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ErrorState } from '@/components/ui/ErrorState';
import type { Job, Profile, RecruiterSubmission } from '@/types';

interface CandidateWithSubmission extends Profile {
    submitted?: boolean;
}

export default function SourcingPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.jobId as string;
    const dashboard = params.dashboard as string;

    const [job, setJob] = useState<Job | null>(null);
    const [candidates, setCandidates] = useState<CandidateWithSubmission[]>([]);
    const [submissions, setSubmissions] = useState<RecruiterSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [submittingId, setSubmittingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [jobId]);

    const fetchData = async () => {
        setIsLoading(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch job details
            const { data: jobData, error: jobError } = await supabase
                .from('jobs')
                .select('*, organization:organizations(name, logo_url)')
                .eq('id', jobId)
                .single();

            if (jobError) throw jobError;

            setJob({
                ...jobData,
                organization: Array.isArray(jobData.organization) ? jobData.organization[0] : jobData.organization
            });

            // Fetch all applicant profiles (candidates to source)
            const { data: profiles } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'applicant')
                .limit(50);

            // Fetch existing submissions
            const { data: subs } = await supabase
                .from('recruiter_submissions')
                .select('*')
                .eq('recruiter_id', user.id)
                .eq('job_id', jobId);

            setSubmissions(subs || []);

            // Mark which candidates are already submitted
            const submittedIds = new Set((subs || []).map(s => s.candidate_id));
            const candidatesWithStatus = (profiles || []).map(p => ({
                ...p,
                submitted: submittedIds.has(p.id)
            }));

            setCandidates(candidatesWithStatus);
            console.log('[Sourcing] Loaded:', profiles?.length, 'candidates');
        } catch (err: any) {
            console.error('[Sourcing] Error:', err);
            setError('Failed to load job details');
        } finally {
            setIsLoading(false);
        }
    };

    const submitCandidate = async (candidateId: string) => {
        setSubmittingId(candidateId);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('recruiter_submissions')
                .insert({
                    recruiter_id: user.id,
                    job_id: jobId,
                    candidate_id: candidateId,
                    status: 'pending',
                })
                .select()
                .single();

            if (error) throw error;

            setSubmissions(prev => [...prev, data]);
            setCandidates(prev => prev.map(c =>
                c.id === candidateId ? { ...c, submitted: true } : c
            ));

            console.log('[Sourcing] Submitted candidate:', candidateId);
        } catch (err: any) {
            console.error('[Sourcing] Error:', err);
            setError('Failed to submit candidate');
        } finally {
            setSubmittingId(null);
        }
    };

    const filteredCandidates = candidates.filter(c => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            c.full_name?.toLowerCase().includes(query) ||
            c.job_title?.toLowerCase().includes(query) ||
            c.skills?.some(s => s.toLowerCase().includes(query))
        );
    });

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="h-32 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl animate-pulse mb-6" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-24 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) return <ErrorState message={error} onRetry={fetchData} />;
    if (!job) return <ErrorState message="Job not found" />;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back */}
            <Link
                href={`/app/org/recruiter/${dashboard}/marketplace`}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Marketplace
            </Link>

            {/* Job Header */}
            <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {job.organization?.logo_url ? (
                            <img src={job.organization.logo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <Building2 className="w-8 h-8 text-gray-500" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold mb-1">{job.title}</h1>
                        <p className="text-gray-400">{job.organization?.name}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            {job.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" /> {job.location}
                                </span>
                            )}
                            {job.salary_range_min && job.salary_range_max && (
                                <span className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    ${job.salary_range_min.toLocaleString()} - ${job.salary_range_max.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Submitted</p>
                        <p className="text-2xl font-bold text-[var(--primary-blue)]">{submissions.length}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search candidates by name, title, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:border-[var(--primary-blue)] focus:outline-none"
                />
            </div>

            {/* Candidates */}
            <h2 className="text-lg font-semibold mb-4">Available Candidates</h2>
            <div className="space-y-3">
                {filteredCandidates.map((candidate) => (
                    <div key={candidate.id} className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                                    {candidate.profile_image_url ? (
                                        <img src={candidate.profile_image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6 text-gray-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-white">{candidate.full_name || 'Anonymous'}</p>
                                    <p className="text-sm text-gray-400">{candidate.job_title || 'No title'}</p>
                                    {candidate.skills && candidate.skills.length > 0 && (
                                        <div className="flex gap-1 mt-1">
                                            {candidate.skills.slice(0, 3).map((skill, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
                                                    {skill}
                                                </span>
                                            ))}
                                            {candidate.skills.length > 3 && (
                                                <span className="text-xs text-gray-500">+{candidate.skills.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => submitCandidate(candidate.id)}
                                disabled={candidate.submitted || submittingId === candidate.id}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${candidate.submitted
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                    : 'bg-[var(--primary-blue)] hover:bg-blue-600 text-white'
                                    } disabled:opacity-50`}
                            >
                                {submittingId === candidate.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : candidate.submitted ? (
                                    <>
                                        <Check className="w-4 h-4" /> Submitted
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" /> Submit
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}

                {filteredCandidates.length === 0 && (
                    <div className="text-center py-12 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl">
                        <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500">No candidates found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
