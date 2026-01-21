'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, Send, Copy, Check, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { createClient } from '@/lib/supabase/client';

interface Job {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    organization: {
        name: string;
    };
}

export default function CoverLetterTool() {
    const params = useParams();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [manualJobDescription, setManualJobDescription] = useState('');
    const [useManualInput, setUseManualInput] = useState(false);
    const [userProfile, setUserProfile] = useState<{
        full_name: string | null;
        skills: string[];
        experience_years: number | null;
        job_title: string | null;
    } | null>(null);
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch jobs and user profile
    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            try {
                // Fetch user profile
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name, skills, experience_years, job_title')
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
                        organization:organizations(name)
                    `)
                    .eq('status', 'published')
                    .limit(50);

                if (jobsError) throw jobsError;

                const transformedJobs = (jobsData || []).map(job => ({
                    ...job,
                    organization: Array.isArray(job.organization) ? job.organization[0] : job.organization
                }));

                setJobs(transformedJobs);
            } catch (err) {
                console.error('[CoverLetter] Error fetching data:', err);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const handleGenerate = async () => {
        const jobDescription = useManualInput
            ? manualJobDescription
            : selectedJob
                ? `${selectedJob.title} at ${selectedJob.organization?.name || 'the company'}\n\n${selectedJob.description}\n\nRequirements: ${selectedJob.requirements?.join(', ') || 'Not specified'}`
                : '';

        if (!jobDescription) {
            setError('Please select a job or enter a job description.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedContent('');

        const profileSummary = userProfile
            ? `Name: ${userProfile.full_name || 'Not specified'}
Current Title: ${userProfile.job_title || 'Not specified'}
Experience: ${userProfile.experience_years || 'Not specified'} years
Skills: ${userProfile.skills?.join(', ') || 'Not specified'}`
            : 'No profile data available';

        const prompt = `
            You are an expert career coach and professional writer.
            Write a compelling, professional cover letter based on the following:
            
            JOB DESCRIPTION:
            ${jobDescription}

            CANDIDATE PROFILE:
            ${profileSummary}

            The cover letter should:
            1. Be engaging and highlight relevant skills from the profile that match the job requirements
            2. Express strong enthusiasm for the specific role and company
            3. Be professional but modern in tone
            4. Be properly formatted with greeting, body paragraphs, and closing
            5. If candidate name is available, sign with their name; otherwise use "[Your Name]"
            
            Do NOT include placeholders like [Company Name] - use the actual company name from the job description.
        `;

        try {
            console.log('[CoverLetter] Generating cover letter...');

            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error('Generation failed');

            const data = await res.json();
            setGeneratedContent(data.result);
            console.log('[CoverLetter] Cover letter generated successfully');
        } catch (err: any) {
            console.error('[CoverLetter] Error:', err);
            setError(err.message || 'Failed to generate cover letter. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
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
                    <div className="p-3 bg-[var(--primary-blue)]/10 rounded-xl text-[var(--primary-blue)]">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Cover Letter Generator</h1>
                        <p className="text-gray-400">Generate tailored cover letters using your profile and job data.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6">
                        <ErrorState message={error} onRetry={() => setError(null)} />
                    </div>
                )}

                {/* Profile Status */}
                {userProfile && (
                    <div className="mb-6 p-4 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Generating as:</p>
                        <p className="font-medium text-white">
                            {userProfile.full_name || 'Anonymous'}
                            {userProfile.job_title && <span className="text-gray-400"> • {userProfile.job_title}</span>}
                        </p>
                        {userProfile.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {userProfile.skills.slice(0, 5).map((skill, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">
                                        {skill}
                                    </span>
                                ))}
                                {userProfile.skills.length > 5 && (
                                    <span className="px-2 py-0.5 text-gray-500 text-xs">
                                        +{userProfile.skills.length - 5} more
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        {/* Toggle Input Mode */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setUseManualInput(false)}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${!useManualInput
                                    ? 'bg-[var(--primary-blue)] text-white'
                                    : 'bg-gray-800 text-gray-400 hover:text-white'
                                    }`}
                            >
                                Select from Jobs
                            </button>
                            <button
                                onClick={() => setUseManualInput(true)}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${useManualInput
                                    ? 'bg-[var(--primary-blue)] text-white'
                                    : 'bg-gray-800 text-gray-400 hover:text-white'
                                    }`}
                            >
                                Paste Description
                            </button>
                        </div>

                        {useManualInput ? (
                            <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                                <label className="block text-sm font-medium mb-2 text-gray-300">
                                    Job Description
                                </label>
                                <textarea
                                    value={manualJobDescription}
                                    onChange={(e) => setManualJobDescription(e.target.value)}
                                    className="w-full h-64 bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none resize-none"
                                    placeholder="Paste the job description here..."
                                />
                            </div>
                        ) : (
                            <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                                <label className="block text-sm font-medium mb-2 text-gray-300">
                                    Select a Job
                                </label>
                                {isLoadingData ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--primary-blue)] border-t-transparent" />
                                    </div>
                                ) : jobs.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 mb-2">No published jobs available.</p>
                                        <button
                                            onClick={() => setUseManualInput(true)}
                                            className="text-[var(--primary-blue)] text-sm hover:underline"
                                        >
                                            Paste a job description instead
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                        {jobs.map((job) => (
                                            <button
                                                key={job.id}
                                                onClick={() => setSelectedJob(job)}
                                                className={`w-full text-left p-3 rounded-lg border transition-all ${selectedJob?.id === job.id
                                                    ? 'border-[var(--primary-blue)] bg-[var(--primary-blue)]/10'
                                                    : 'border-gray-800 bg-[#0b0c0f] hover:border-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4 text-gray-500 shrink-0" />
                                                    <div>
                                                        <p className="font-medium text-white text-sm">{job.title}</p>
                                                        <p className="text-xs text-gray-400">{job.organization?.name}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || (!useManualInput && !selectedJob) || (useManualInput && !manualJobDescription)}
                            className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                        >
                            {isLoading ? (
                                <>
                                    Generating...
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                </>
                            ) : (
                                <>
                                    Generate Cover Letter
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Output Section */}
                    <div className="relative">
                        <div className="h-full min-h-[500px] bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8 relative">
                            {generatedContent ? (
                                <>
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
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
                                    <FileText className="w-16 h-16 mb-4" />
                                    <p className="text-lg">Your generated cover letter will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
