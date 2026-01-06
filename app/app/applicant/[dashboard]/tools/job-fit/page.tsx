'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Target, TrendingUp, AlertCircle, CheckCircle, XCircle, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { createClient } from '@/lib/supabase/client';

interface Job {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    salary_range_min: number | null;
    salary_range_max: number | null;
    location: string | null;
    organization: {
        name: string;
    };
}

interface FitAnalysis {
    overallScore: number;
    matchReasons: string[];
    missingSkills: string[];
    strengthAreas: string[];
    salaryFit: string;
    recommendation: string;
}

export default function JobFitPredictorTool() {
    const params = useParams();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [userProfile, setUserProfile] = useState<{
        skills: string[];
        experience_years: number | null;
        job_title: string | null;
    } | null>(null);
    const [analysis, setAnalysis] = useState<FitAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch published jobs and user profile
    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            try {
                // Fetch user profile
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('skills, experience_years, job_title')
                        .eq('id', user.id)
                        .single();

                    if (profile) {
                        setUserProfile(profile);
                    }
                }

                // Fetch published jobs
                const { data: jobsData, error: jobsError } = await supabase
                    .from('jobs')
                    .select(`
                        id,
                        title,
                        description,
                        requirements,
                        salary_range_min,
                        salary_range_max,
                        location,
                        organization:organizations(name)
                    `)
                    .eq('status', 'published')
                    .limit(50);

                if (jobsError) throw jobsError;

                // Transform the data to flatten organization
                const transformedJobs = (jobsData || []).map(job => ({
                    ...job,
                    organization: Array.isArray(job.organization) ? job.organization[0] : job.organization
                }));

                setJobs(transformedJobs);
            } catch (err) {
                console.error('[JobFitPredictor] Error fetching data:', err);
                setError('Failed to load jobs. Please refresh the page.');
            } finally {
                setIsLoadingJobs(false);
            }
        };

        fetchData();
    }, []);

    const handleAnalyze = async () => {
        if (!selectedJob || !userProfile) return;

        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        const prompt = `
            You are an expert career advisor and job matching specialist. Analyze the fit between this candidate and job.
            
            CANDIDATE PROFILE:
            - Current/Target Job Title: ${userProfile.job_title || 'Not specified'}
            - Years of Experience: ${userProfile.experience_years || 'Not specified'}
            - Skills: ${userProfile.skills?.join(', ') || 'None listed'}
            
            JOB POSTING:
            - Title: ${selectedJob.title}
            - Company: ${selectedJob.organization?.name || 'Unknown'}
            - Location: ${selectedJob.location || 'Not specified'}
            - Description: ${selectedJob.description}
            - Requirements: ${selectedJob.requirements?.join(', ') || 'None listed'}
            - Salary Range: ${selectedJob.salary_range_min && selectedJob.salary_range_max
                ? `$${selectedJob.salary_range_min.toLocaleString()} - $${selectedJob.salary_range_max.toLocaleString()}`
                : 'Not specified'}
            
            Provide a detailed fit analysis. Return ONLY a valid JSON object:
            {
                "overallScore": number (0-100, where 100 is perfect match),
                "matchReasons": ["reason1", "reason2", ...] (why they're a good fit),
                "missingSkills": ["skill1", "skill2", ...] (skills they should develop),
                "strengthAreas": ["area1", "area2", ...] (where they excel for this role),
                "salaryFit": "string describing if role matches their experience level for compensation",
                "recommendation": "detailed 2-3 sentence recommendation on whether to apply and how to position themselves"
            }
            
            Return ONLY the JSON object, no markdown or additional text.
        `;

        try {
            console.log('[JobFitPredictor] Starting analysis for job:', selectedJob.title);

            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error(`API error: ${res.status}`);

            const data = await res.json();

            // Parse JSON response
            let cleanResult = data.result.trim();
            if (cleanResult.startsWith('```json')) {
                cleanResult = cleanResult.replace(/```json\n?/, '').replace(/\n?```$/, '');
            } else if (cleanResult.startsWith('```')) {
                cleanResult = cleanResult.replace(/```\n?/, '').replace(/\n?```$/, '');
            }

            const parsed = JSON.parse(cleanResult);
            console.log('[JobFitPredictor] Analysis complete:', parsed);
            setAnalysis(parsed);
        } catch (err: any) {
            console.error('[JobFitPredictor] Error:', err);
            setError(err.message || 'Failed to analyze job fit. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-500/20 border-green-500/30';
        if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
        if (score >= 40) return 'bg-orange-500/20 border-orange-500/30';
        return 'bg-red-500/20 border-red-500/30';
    };

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-5xl mx-auto">
                <Link
                    href={`/app/applicant/${params.dashboard}/tools`}
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                        <Target className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Job Fit Predictor</h1>
                        <p className="text-gray-400">See how well you match with open positions before applying.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6">
                        <ErrorState message={error} onRetry={() => setError(null)} />
                    </div>
                )}

                {!userProfile?.skills?.length && !isLoadingJobs && (
                    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium">Profile Incomplete</p>
                            <p className="text-sm text-yellow-400/80">
                                Add your skills to your profile for more accurate job matching.{' '}
                                <Link href={`/app/applicant/${params.dashboard}/tools/resume-parser`} className="underline">
                                    Use the Resume Parser
                                </Link>
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Job Selection */}
                    <div className="space-y-6">
                        <div className="card p-6 border border-gray-800 bg-[#15171e]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">
                                Select a Job to Analyze
                            </label>
                            {isLoadingJobs ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--primary-blue)] border-t-transparent" />
                                </div>
                            ) : jobs.length === 0 ? (
                                <p className="text-gray-500 py-4">No published jobs available.</p>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                    {jobs.map((job) => (
                                        <button
                                            key={job.id}
                                            onClick={() => setSelectedJob(job)}
                                            className={`w-full text-left p-4 rounded-lg border transition-all ${selectedJob?.id === job.id
                                                    ? 'border-[var(--primary-blue)] bg-[var(--primary-blue)]/10'
                                                    : 'border-gray-800 bg-[#0b0c0f] hover:border-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Briefcase className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="font-medium text-white">{job.title}</p>
                                                    <p className="text-sm text-gray-400">{job.organization?.name || 'Unknown Company'}</p>
                                                    {job.location && (
                                                        <p className="text-xs text-gray-500 mt-1">{job.location}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading || !selectedJob}
                            className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                        >
                            {isLoading ? (
                                <>
                                    Analyzing Fit...
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                </>
                            ) : (
                                <>
                                    <TrendingUp className="w-4 h-4" />
                                    Analyze My Fit
                                </>
                            )}
                        </button>
                    </div>

                    {/* Analysis Results */}
                    <div className="bg-[#15171e] border border-gray-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4">Fit Analysis</h2>

                        {analysis ? (
                            <div className="space-y-4">
                                {/* Score */}
                                <div className={`p-6 rounded-lg border text-center ${getScoreBg(analysis.overallScore)}`}>
                                    <p className="text-sm text-gray-400 mb-1">Compatibility Score</p>
                                    <p className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                                        {analysis.overallScore}%
                                    </p>
                                </div>

                                {/* Match Reasons */}
                                {analysis.matchReasons.length > 0 && (
                                    <div className="p-4 bg-[#0b0c0f] rounded-lg border border-gray-800">
                                        <div className="flex items-center gap-2 text-sm text-green-400 mb-2">
                                            <CheckCircle className="w-4 h-4" />
                                            Why You&apos;re a Good Fit
                                        </div>
                                        <ul className="space-y-1">
                                            {analysis.matchReasons.map((reason, idx) => (
                                                <li key={idx} className="text-sm text-gray-300">• {reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Strength Areas */}
                                {analysis.strengthAreas.length > 0 && (
                                    <div className="p-4 bg-[#0b0c0f] rounded-lg border border-gray-800">
                                        <div className="text-sm text-[var(--primary-blue)] mb-2">Your Strengths</div>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.strengthAreas.map((area, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-[var(--primary-blue)]/10 text-[var(--primary-blue)] rounded text-xs">
                                                    {area}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Missing Skills */}
                                {analysis.missingSkills.length > 0 && (
                                    <div className="p-4 bg-[#0b0c0f] rounded-lg border border-gray-800">
                                        <div className="flex items-center gap-2 text-sm text-orange-400 mb-2">
                                            <XCircle className="w-4 h-4" />
                                            Skills to Develop
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.missingSkills.map((skill, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded text-xs">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Salary Fit */}
                                <div className="p-4 bg-[#0b0c0f] rounded-lg border border-gray-800">
                                    <div className="text-sm text-gray-400 mb-1">Salary Fit</div>
                                    <p className="text-gray-300 text-sm">{analysis.salaryFit}</p>
                                </div>

                                {/* Recommendation */}
                                <div className="p-4 bg-[var(--primary-blue)]/10 rounded-lg border border-[var(--primary-blue)]/30">
                                    <div className="text-sm text-[var(--primary-blue)] mb-1 font-medium">Recommendation</div>
                                    <p className="text-gray-300 text-sm">{analysis.recommendation}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                <Target className="w-16 h-16 mb-4 opacity-30" />
                                <p className="text-center">Select a job and click &quot;Analyze My Fit&quot; to see your compatibility.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
