'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Send, Copy, Check, MessageSquare, Briefcase, Save } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { createClient } from '@/lib/supabase/client';

interface Job {
    id: string;
    title: string;
    description: string;
    requirements: string[];
}

export default function EmployerInterviewTool() {
    const params = useParams();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [title, setTitle] = useState('');
    const [level, setLevel] = useState('Senior');
    const [interviewRound, setInterviewRound] = useState('1');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch organization's jobs
    useEffect(() => {
        const fetchJobs = async () => {
            const supabase = createClient();

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoadingJobs(false);
                    return;
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', user.id)
                    .single();

                if (!profile?.organization_id) {
                    setIsLoadingJobs(false);
                    return;
                }

                const { data: jobsData } = await supabase
                    .from('jobs')
                    .select('id, title, description, requirements')
                    .eq('organization_id', profile.organization_id)
                    .order('created_at', { ascending: false });

                setJobs(jobsData || []);
                console.log('[InterviewScript] Loaded jobs:', jobsData?.length);
            } catch (err) {
                console.error('[InterviewScript] Error:', err);
            } finally {
                setIsLoadingJobs(false);
            }
        };

        fetchJobs();
    }, []);

    const handleGenerate = async () => {
        const jobTitle = selectedJob?.title || title;
        if (!jobTitle) {
            setError('Please select a job or enter a role title.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedContent('');

        const jobDescription = selectedJob?.description || '';
        const requirements = selectedJob?.requirements?.join(', ') || '';

        const prompt = `
            Generate a comprehensive technical interview script for a ${level} ${jobTitle} position.
            Interview Round: ${interviewRound}
            
            ${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}\n` : ''}
            ${requirements ? `REQUIREMENTS:\n${requirements}\n` : ''}
            
            Create a structured interview script including:
            
            ## 🎯 Interview Overview
            - Estimated Duration
            - Key Competencies to Assess
            - Scoring Guide (1-5 scale explanation)
            
            ## 👋 Opening (5 min)
            - Warm welcome script
            - Brief company/role introduction
            - Interview structure explanation
            
            ## 🧠 Ice-Breaker Question
            - One question to make candidate comfortable
            - Expected response themes
            
            ## 💡 Core Technical Questions (${interviewRound === '1' ? '3' : '4'} questions)
            For each question provide:
            - The question
            - Why we ask this (what it reveals)
            - ✅ Strong answer indicators
            - ⚠️ Red flags to watch for
            - Follow-up probes
            
            ## 🏗️ ${interviewRound === '1' ? 'Problem-Solving Exercise' : 'System Design Challenge'}
            - A realistic scenario/problem
            - Evaluation criteria
            - Time allocation
            
            ## 🤝 Cultural Fit Questions (2 questions)
            - Questions to assess culture alignment
            - What great answers look like
            
            ## ❓ Candidate Questions (5 min)
            - Suggested closing for Q&A
            - How to handle tough questions
            
            ## 📝 Post-Interview Scorecard
            Provide a simple scorecard template to rate the candidate.
            
            Make this practical and ready to use. Format with clear headings.
        `;

        try {
            console.log('[InterviewScript] Generating script for:', jobTitle);

            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error('Generation failed');

            const data = await res.json();
            setGeneratedContent(data.result);
            console.log('[InterviewScript] Script generated');
        } catch (err: any) {
            console.error('[InterviewScript] Error:', err);
            setError(err.message || 'Failed to generate script.');
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
                    href={`/app/org/employer/${params.dashboard}/tools`}
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Interview Script Generator</h1>
                        <p className="text-gray-400">Create structured interview scripts with scoring guides.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6">
                        <ErrorState message={error} onRetry={() => setError(null)} />
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        {/* Job Selection */}
                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">Select Job</label>
                            {isLoadingJobs ? (
                                <div className="flex items-center justify-center py-3">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--primary-blue)] border-t-transparent" />
                                </div>
                            ) : jobs.length > 0 ? (
                                <select
                                    value={selectedJob?.id || ''}
                                    onChange={(e) => {
                                        const job = jobs.find(j => j.id === e.target.value);
                                        setSelectedJob(job || null);
                                        if (job) setTitle('');
                                    }}
                                    className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                >
                                    <option value="">-- Select from your jobs --</option>
                                    {jobs.map((job) => (
                                        <option key={job.id} value={job.id}>{job.title}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-gray-500 text-sm">No jobs found. Enter role manually below.</p>
                            )}
                        </div>

                        {!selectedJob && (
                            <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                                <label className="block text-sm font-medium mb-2 text-gray-300">Role Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                    placeholder="e.g. Backend Engineer"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                                <label className="block text-sm font-medium mb-2 text-gray-300">Experience Level</label>
                                <select
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                >
                                    <option>Junior / Entry Level</option>
                                    <option>Mid-Level</option>
                                    <option>Senior</option>
                                    <option>Lead / Principal</option>
                                    <option>Executive</option>
                                </select>
                            </div>

                            <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                                <label className="block text-sm font-medium mb-2 text-gray-300">Interview Round</label>
                                <select
                                    value={interviewRound}
                                    onChange={(e) => setInterviewRound(e.target.value)}
                                    className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                >
                                    <option value="1">Round 1 - Initial Screen</option>
                                    <option value="2">Round 2 - Technical Deep Dive</option>
                                    <option value="3">Round 3 - Final / Culture</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || (!selectedJob && !title)}
                            className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    Generating...
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="w-4 h-4" />
                                    Generate Interview Script
                                </>
                            )}
                        </button>
                    </div>

                    <div className="relative">
                        <div className="h-full min-h-[600px] max-h-[800px] bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8 relative overflow-auto">
                            {generatedContent ? (
                                <>
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors z-10"
                                        title="Copy to clipboard"
                                    >
                                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm">
                                        {generatedContent}
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 opacity-50 p-6 text-center">
                                    <MessageSquare className="w-16 h-16 mb-4" />
                                    <p className="text-lg">Interview script will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
