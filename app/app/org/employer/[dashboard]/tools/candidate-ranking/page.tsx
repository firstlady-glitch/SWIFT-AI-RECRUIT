'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Users, TrendingUp, CheckCircle, XCircle, Star, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { createClient } from '@/lib/supabase/client';

interface Job {
    id: string;
    title: string;
    description: string;
    requirements: string[];
}

interface Application {
    id: string;
    status: string;
    score: number | null;
    match_reasons: string[] | null;
    applicant: {
        id: string;
        full_name: string | null;
        email: string | null;
        job_title: string | null;
        experience_years: number | null;
        skills: string[] | null;
    };
}

interface RankedCandidate extends Application {
    aiScore: number;
    aiMatchReasons: string[];
    isExpanded: boolean;
}

export default function CandidateRankingTool() {
    const params = useParams();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [rankedCandidates, setRankedCandidates] = useState<RankedCandidate[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [isLoadingApplications, setIsLoadingApplications] = useState(false);
    const [isRanking, setIsRanking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch employer's jobs
    useEffect(() => {
        const fetchJobs = async () => {
            const supabase = createClient();

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Get user's organization
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', user.id)
                    .single();

                if (!profile?.organization_id) {
                    setError('No organization found. Please set up your organization first.');
                    setIsLoadingJobs(false);
                    return;
                }

                // Fetch organization's jobs
                const { data: jobsData, error: jobsError } = await supabase
                    .from('jobs')
                    .select('id, title, description, requirements')
                    .eq('organization_id', profile.organization_id)
                    .order('created_at', { ascending: false });

                if (jobsError) throw jobsError;
                setJobs(jobsData || []);
            } catch (err) {
                console.error('[CandidateRanking] Error fetching jobs:', err);
                setError('Failed to load jobs.');
            } finally {
                setIsLoadingJobs(false);
            }
        };

        fetchJobs();
    }, []);

    // Fetch applications when job is selected
    const fetchApplications = async (jobId: string) => {
        setIsLoadingApplications(true);
        setApplications([]);
        setRankedCandidates([]);
        setError(null);

        const supabase = createClient();

        try {
            const { data, error: appError } = await supabase
                .from('applications')
                .select(`
                    id,
                    status,
                    score,
                    match_reasons,
                    applicant:profiles!applications_applicant_id_fkey(
                        id,
                        full_name,
                        email,
                        job_title,
                        experience_years,
                        skills
                    )
                `)
                .eq('job_id', jobId)
                .order('created_at', { ascending: false });

            if (appError) throw appError;

            // Transform the data
            const transformedApps = (data || []).map(app => ({
                ...app,
                applicant: Array.isArray(app.applicant) ? app.applicant[0] : app.applicant
            }));

            setApplications(transformedApps);
            console.log('[CandidateRanking] Fetched applications:', transformedApps.length);
        } catch (err) {
            console.error('[CandidateRanking] Error fetching applications:', err);
            setError('Failed to load applications.');
        } finally {
            setIsLoadingApplications(false);
        }
    };

    const handleJobSelect = (job: Job) => {
        setSelectedJob(job);
        fetchApplications(job.id);
    };

    const handleRankCandidates = async () => {
        if (!selectedJob || applications.length === 0) return;

        setIsRanking(true);
        setError(null);

        const candidatesData = applications.map(app => ({
            id: app.id,
            name: app.applicant?.full_name || 'Unknown',
            title: app.applicant?.job_title || 'Not specified',
            experience: app.applicant?.experience_years || 0,
            skills: app.applicant?.skills || []
        }));

        const prompt = `
            You are an expert recruiter and hiring manager. Rank these candidates for the following job.
            
            JOB:
            Title: ${selectedJob.title}
            Description: ${selectedJob.description}
            Requirements: ${selectedJob.requirements?.join(', ') || 'None specified'}
            
            CANDIDATES:
            ${candidatesData.map((c, i) => `
            ${i + 1}. Name: ${c.name}
               Current Title: ${c.title}
               Experience: ${c.experience} years
               Skills: ${c.skills.join(', ') || 'None listed'}
            `).join('\n')}
            
            For each candidate, provide a score (0-100) and 2-3 match reasons.
            Return ONLY a valid JSON array:
            [
                {
                    "id": "application_id",
                    "score": number,
                    "matchReasons": ["reason1", "reason2"]
                }
            ]
            
            Return ONLY the JSON array, no markdown or additional text.
            Order candidates by score descending (best first).
        `;

        try {
            console.log('[CandidateRanking] Starting AI ranking...');

            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error('Ranking failed');

            const data = await res.json();

            // Parse JSON response
            let cleanResult = data.result.trim();
            if (cleanResult.startsWith('```json')) {
                cleanResult = cleanResult.replace(/```json\n?/, '').replace(/\n?```$/, '');
            } else if (cleanResult.startsWith('```')) {
                cleanResult = cleanResult.replace(/```\n?/, '').replace(/\n?```$/, '');
            }

            const rankings = JSON.parse(cleanResult);

            // Merge rankings with applications
            const ranked: RankedCandidate[] = applications.map(app => {
                const ranking = rankings.find((r: { id: string; score: number; matchReasons: string[] }) => r.id === app.id);
                return {
                    ...app,
                    aiScore: ranking?.score || 0,
                    aiMatchReasons: ranking?.matchReasons || [],
                    isExpanded: false
                };
            }).sort((a, b) => b.aiScore - a.aiScore);

            setRankedCandidates(ranked);
            console.log('[CandidateRanking] Ranking complete');
        } catch (err: any) {
            console.error('[CandidateRanking] Error:', err);
            setError(err.message || 'Failed to rank candidates.');
        } finally {
            setIsRanking(false);
        }
    };

    const updateCandidateStatus = async (applicationId: string, newStatus: string) => {
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from('applications')
                .update({ status: newStatus })
                .eq('id', applicationId);

            if (error) throw error;

            // Update local state
            setRankedCandidates(prev => prev.map(c =>
                c.id === applicationId ? { ...c, status: newStatus } : c
            ));

            console.log('[CandidateRanking] Updated status to:', newStatus);
        } catch (err) {
            console.error('[CandidateRanking] Failed to update status:', err);
            setError('Failed to update candidate status.');
        }
    };

    const toggleExpand = (id: string) => {
        setRankedCandidates(prev => prev.map(c =>
            c.id === id ? { ...c, isExpanded: !c.isExpanded } : c
        ));
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500 bg-green-500/20';
        if (score >= 60) return 'text-yellow-500 bg-yellow-500/20';
        if (score >= 40) return 'text-orange-500 bg-orange-500/20';
        return 'text-red-500 bg-red-500/20';
    };

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-6xl mx-auto">
                <Link
                    href={`/app/org/employer/${params.dashboard}/tools`}
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Candidate Ranking Engine</h1>
                        <p className="text-gray-400">AI-powered candidate scoring and ranking for your jobs.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6">
                        <ErrorState message={error} onRetry={() => setError(null)} />
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Job Selection */}
                    <div className="lg:col-span-1">
                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)] sticky top-8">
                            <h2 className="text-lg font-semibold mb-4">Select a Job</h2>

                            {isLoadingJobs ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--primary-blue)] border-t-transparent" />
                                </div>
                            ) : jobs.length === 0 ? (
                                <p className="text-gray-500 text-sm py-4">No jobs found. Create a job first.</p>
                            ) : (
                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                    {jobs.map((job) => (
                                        <button
                                            key={job.id}
                                            onClick={() => handleJobSelect(job)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${selectedJob?.id === job.id
                                                ? 'border-[var(--primary-blue)] bg-[var(--primary-blue)]/10'
                                                : 'border-gray-800 bg-[#0b0c0f] hover:border-gray-700'
                                                }`}
                                        >
                                            <p className="font-medium text-white text-sm truncate">{job.title}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {selectedJob && applications.length > 0 && (
                                <button
                                    onClick={handleRankCandidates}
                                    disabled={isRanking}
                                    className="w-full mt-4 btn btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isRanking ? (
                                        <>
                                            Ranking...
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        </>
                                    ) : (
                                        <>
                                            <TrendingUp className="w-4 h-4" />
                                            Rank Candidates
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Candidates List */}
                    <div className="lg:col-span-2">
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4">
                                Candidates
                                {applications.length > 0 && (
                                    <span className="text-gray-400 font-normal ml-2">({applications.length})</span>
                                )}
                            </h2>

                            {isLoadingApplications ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-blue)] border-t-transparent" />
                                </div>
                            ) : !selectedJob ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                    <Users className="w-16 h-16 mb-4 opacity-30" />
                                    <p>Select a job to view candidates</p>
                                </div>
                            ) : applications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                    <Users className="w-16 h-16 mb-4 opacity-30" />
                                    <p>No applications for this job yet</p>
                                </div>
                            ) : rankedCandidates.length > 0 ? (
                                <div className="space-y-3">
                                    {rankedCandidates.map((candidate, idx) => (
                                        <div
                                            key={candidate.id}
                                            className="border border-gray-800 rounded-lg bg-[#0b0c0f] overflow-hidden"
                                        >
                                            <div
                                                className="p-4 cursor-pointer"
                                                onClick={() => toggleExpand(candidate.id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 text-gray-400 font-bold text-sm">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">
                                                                {candidate.applicant?.full_name || 'Unknown'}
                                                            </p>
                                                            <p className="text-sm text-gray-400">
                                                                {candidate.applicant?.job_title || 'No title'}
                                                                {candidate.applicant?.experience_years && (
                                                                    <span> • {candidate.applicant.experience_years} yrs exp</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(candidate.aiScore)}`}>
                                                            {candidate.aiScore}%
                                                        </div>
                                                        {candidate.isExpanded ? (
                                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {candidate.isExpanded && (
                                                <div className="px-4 pb-4 border-t border-gray-800 pt-4">
                                                    {/* Match Reasons */}
                                                    {candidate.aiMatchReasons.length > 0 && (
                                                        <div className="mb-4">
                                                            <p className="text-xs text-gray-400 mb-2">Match Reasons:</p>
                                                            <ul className="space-y-1">
                                                                {candidate.aiMatchReasons.map((reason, i) => (
                                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                                        <Star className="w-3 h-3 text-yellow-500 mt-1 shrink-0" />
                                                                        {reason}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Skills */}
                                                    {(candidate.applicant?.skills?.length ?? 0) > 0 && (
                                                        <div className="mb-4">
                                                            <p className="text-xs text-gray-400 mb-2">Skills:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {(candidate.applicant?.skills || []).slice(0, 8).map((skill, i) => (
                                                                    <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => updateCandidateStatus(candidate.id, 'shortlisted')}
                                                            disabled={candidate.status === 'shortlisted'}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-sm hover:bg-green-500/20 disabled:opacity-50 transition-colors"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Shortlist
                                                        </button>
                                                        <button
                                                            onClick={() => updateCandidateStatus(candidate.id, 'interview')}
                                                            disabled={candidate.status === 'interview'}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-[var(--primary-blue)]/10 text-[var(--primary-blue)] rounded-lg text-sm hover:bg-[var(--primary-blue)]/20 disabled:opacity-50 transition-colors"
                                                        >
                                                            <Users className="w-4 h-4" />
                                                            Interview
                                                        </button>
                                                        <button
                                                            onClick={() => updateCandidateStatus(candidate.id, 'rejected')}
                                                            disabled={candidate.status === 'rejected'}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {applications.map((app) => (
                                        <div key={app.id} className="p-4 border border-gray-800 rounded-lg bg-[#0b0c0f]">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-white">
                                                        {app.applicant?.full_name || 'Unknown'}
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        {app.applicant?.job_title || 'No title'}
                                                    </p>
                                                </div>
                                                <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs capitalize">
                                                    {app.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <p className="text-center text-gray-500 text-sm mt-4">
                                        Click &quot;Rank Candidates&quot; to get AI-powered scores
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
