'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    ArrowLeft,
    Sparkles,
    Copy,
    Check,
    RefreshCw,
    FileText,
    Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { createClient } from '@/lib/supabase/client';

interface Profile {
    job_title: string | null;
    skills: string[] | null;
    experience_years: number | null;
    resume_url: string | null;
}

interface Job {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    organization: {
        name: string;
    };
}

type ResumeSource = 'none' | 'profile_pdf' | 'profile_fields' | 'manual';

export default function ResumeOptimizerTool() {
    const params = useParams();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [resumeContent, setResumeContent] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [resumeLoadState, setResumeLoadState] = useState<
        'idle' | 'loading' | 'done'
    >('idle');
    const [resumeSource, setResumeSource] = useState<ResumeSource>('none');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const buildProfileSummary = useCallback((p: Profile) => {
        return `
Current Role: ${p.job_title || 'Not specified'}
Experience: ${p.experience_years ?? 0} years
Skills: ${p.skills?.join(', ') || 'Not specified'}
        `.trim();
    }, []);

    const handleUseProfile = () => {
        if (!profile) return;
        setResumeContent(buildProfileSummary(profile));
        setResumeSource('profile_fields');
    };

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoadingData(false);
                    return;
                }

                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('job_title, skills, experience_years, resume_url')
                    .eq('id', user.id)
                    .single();

                if (profileData) {
                    setProfile(profileData as Profile);
                }

                const { data: jobsData } = await supabase
                    .from('jobs')
                    .select(
                        `
                        id,
                        title,
                        description,
                        requirements,
                        organization:organizations(name)
                    `
                    )
                    .in('status', ['published', 'open'])
                    .limit(30);

                const transformed = (jobsData || []).map((job) => ({
                    ...job,
                    organization: Array.isArray(job.organization)
                        ? job.organization[0]
                        : job.organization,
                }));

                setJobs(transformed as Job[]);
            } catch (err) {
                console.error('[ResumeOptimizer] Error:', err);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!profile) return;
        let cancelled = false;

        const loadResume = async () => {
            if (profile.resume_url?.trim()) {
                setResumeLoadState('loading');
                try {
                    const r = await fetch('/api/applicant/resume-text');
                    const d = await r.json();
                    if (
                        !cancelled &&
                        d.text &&
                        String(d.text).trim().length > 0
                    ) {
                        setResumeContent(String(d.text).trim());
                        setResumeSource('profile_pdf');
                        setResumeLoadState('done');
                        return;
                    }
                } catch (e) {
                    console.error('[ResumeOptimizer] resume-text', e);
                }
                if (!cancelled) setResumeLoadState('done');
            } else {
                setResumeLoadState('done');
            }

            if (cancelled) return;
            if (profile.job_title || (profile.skills && profile.skills.length)) {
                setResumeContent((prev) => {
                    if (prev.trim()) return prev;
                    return buildProfileSummary(profile);
                });
                setResumeSource((s) => (s === 'profile_pdf' ? s : 'profile_fields'));
            }
        };

        loadResume();
        return () => {
            cancelled = true;
        };
    }, [profile, buildProfileSummary]);

    const handleGenerate = async () => {
        if (!resumeContent.trim()) {
            setError('Add resume text, or ensure your profile has an uploaded resume.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedContent('');

        const role = selectedJob?.title || targetRole || 'General Professional';
        const jobRequirements = selectedJob?.requirements?.join(', ') || '';
        const jobDescription = selectedJob?.description || '';

        const prompt = `
            You are an expert resume reviewer and ATS optimization specialist.
            Review the following resume content for the target role of "${role}".
            
            RESUME CONTENT:
            ${resumeContent}
            
            ${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n` : ''}
            ${jobRequirements ? `KEY REQUIREMENTS:\n${jobRequirements}\n` : ''}

            Provide a comprehensive analysis including:
            
            ## ATS Score Estimate
            Rate the resume's ATS compatibility (0-100) and explain why.
            
            ## Summary/Objective Improvements
            Rewrite a stronger professional summary tailored to the target role.
            
            ## Bullet Point Enhancements
            Provide 5 examples of how to strengthen experience bullets using:
            - Action verbs
            - Quantifiable achievements
            - Results-oriented language
            
            ## Missing Keywords
            List 10 keywords from the job requirements that should be added.
            
            ## Formatting Tips
            Provide 3-5 specific formatting improvements.
            
            ## Tailored Recommendations
            3 specific suggestions to better match this exact role.
            
            Format the response with clear headings and be specific.
        `;

        try {
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });

            if (!res.ok) throw new Error('Analysis failed');

            const data = await res.json();
            setGeneratedContent(data.result);
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : 'Failed to analyze resume.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const sourceLabel =
        resumeSource === 'profile_pdf'
            ? 'Loaded from your profile resume file'
            : resumeSource === 'profile_fields'
              ? 'Using profile summary (no file text extracted)'
              : resumeSource === 'manual'
                ? 'Edited manually'
                : null;

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
                    <div className="p-3 bg-[var(--primary-purple)]/10 rounded-xl text-[var(--primary-purple)]">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Resume Optimizer</h1>
                        <p className="text-gray-400">
                            AI feedback for your resume. We pull text from the file you
                            uploaded at registration when possible.
                        </p>
                    </div>
                </div>

                {profile?.resume_url && resumeLoadState === 'loading' && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] px-4 py-3 text-sm text-[var(--foreground-secondary)]">
                        <Loader2 className="w-4 h-4 animate-spin text-[var(--primary-blue)]" />
                        Reading your saved resume from your profile…
                    </div>
                )}

                {sourceLabel && resumeLoadState === 'done' && (
                    <div className="mb-6 flex items-center gap-2 rounded-xl border border-[var(--primary-blue)]/30 bg-[var(--primary-blue)]/10 px-4 py-3 text-sm">
                        <FileText className="w-4 h-4 text-[var(--primary-blue)] shrink-0" />
                        <span>{sourceLabel}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-6">
                        <ErrorState message={error} onRetry={() => setError(null)} />
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        {profile && (profile.job_title || profile.skills?.length) && (
                            <div className="card p-4 border border-[var(--border)] bg-[var(--background-secondary)]">
                                <button
                                    type="button"
                                    onClick={handleUseProfile}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--primary-blue)]/10 text-[var(--primary-blue)] rounded-lg hover:bg-[var(--primary-blue)]/20 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Replace with profile summary
                                </button>
                                <p className="text-xs text-[var(--foreground-secondary)] text-center mt-2">
                                    Use this if you prefer a short skill/title summary instead
                                    of your full resume file.
                                </p>
                            </div>
                        )}

                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                Target Job (Optional)
                            </label>
                            {isLoadingData ? (
                                <div className="flex items-center justify-center py-3">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--primary-blue)] border-t-transparent" />
                                </div>
                            ) : (
                                <select
                                    value={selectedJob?.id || ''}
                                    onChange={(e) => {
                                        const job = jobs.find((j) => j.id === e.target.value);
                                        setSelectedJob(job || null);
                                        if (job) setTargetRole('');
                                    }}
                                    className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                >
                                    <option value="">— Select a live job —</option>
                                    {jobs.map((job) => (
                                        <option key={job.id} value={job.id}>
                                            {job.title} at {job.organization?.name || 'Unknown'}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {!selectedJob && (
                            <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                                <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                    Or Enter Target Role
                                </label>
                                <input
                                    type="text"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                    placeholder="e.g. Senior Product Manager"
                                />
                            </div>
                        )}

                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                Your Resume Content
                            </label>
                            <textarea
                                value={resumeContent}
                                onChange={(e) => {
                                    setResumeContent(e.target.value);
                                    setResumeSource('manual');
                                }}
                                className="w-full h-64 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none resize-none font-mono"
                                placeholder={
                                    profile?.resume_url
                                        ? 'Loading from your profile resume…'
                                        : 'Paste resume text, or complete your profile with a resume upload.'
                                }
                                disabled={resumeLoadState === 'loading'}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={
                                isLoading ||
                                !resumeContent.trim() ||
                                resumeLoadState === 'loading'
                            }
                            className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    Analyzing…
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Optimize Resume
                                </>
                            )}
                        </button>
                    </div>

                    <div className="relative">
                        <div className="h-full min-h-[600px] bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8 relative overflow-auto">
                            {generatedContent ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={copyToClipboard}
                                        className="absolute top-4 right-4 p-2 bg-[var(--background)] hover:bg-[var(--background-secondary)] rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title="Copy to clipboard"
                                    >
                                        {isCopied ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                    <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm">
                                        {generatedContent}
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 opacity-50 p-6 text-center">
                                    <Sparkles className="w-16 h-16 mb-4" />
                                    <p className="text-lg">AI optimization feedback will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
