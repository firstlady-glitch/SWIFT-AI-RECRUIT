'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Send, Copy, Check, MessageSquare, Briefcase, Play, RotateCcw } from 'lucide-react';
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

interface Question {
    category: string;
    question: string;
    hint: string;
}

export default function InterviewPrepTool() {
    const params = useParams();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [manualJobTitle, setManualJobTitle] = useState('');
    const [manualJobDescription, setManualJobDescription] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'select' | 'practice'>('select');

    // Fetch jobs user has applied to
    useEffect(() => {
        const fetchJobs = async () => {
            const supabase = createClient();

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoadingJobs(false);
                    return;
                }

                // Get jobs user has applied to
                const { data: applications } = await supabase
                    .from('applications')
                    .select(`
                        job:jobs!applications_job_id_fkey(
                            id,
                            title,
                            description,
                            requirements,
                            organization:organizations(name)
                        )
                    `)
                    .eq('applicant_id', user.id)
                    .limit(20);

                const jobsData = (applications || [])
                    .map(app => {
                        const job = Array.isArray(app.job) ? app.job[0] : app.job;
                        if (!job) return null;
                        return {
                            ...job,
                            organization: Array.isArray(job.organization) ? job.organization[0] : job.organization
                        };
                    })
                    .filter((j): j is Job => j !== null);

                setJobs(jobsData);
                console.log('[InterviewPrep] Loaded applied jobs:', jobsData.length);
            } catch (err) {
                console.error('[InterviewPrep] Error:', err);
            } finally {
                setIsLoadingJobs(false);
            }
        };

        fetchJobs();
    }, []);

    const handleGenerate = async () => {
        const jobTitle = selectedJob?.title || manualJobTitle;
        if (!jobTitle) {
            setError('Please select a job or enter a job title.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setQuestions([]);

        const jobDescription = selectedJob?.description || manualJobDescription;
        const requirements = selectedJob?.requirements?.join(', ') || '';

        const prompt = `
            You are a tough interviewer for a top company.
            Generate interview questions for the role: ${jobTitle}.
            
            CONTEXT:
            ${jobDescription}
            
            REQUIREMENTS:
            ${requirements}

            Generate exactly 8 questions in these categories:
            - 3 Behavioral Questions (STAR method)
            - 3 Technical/Role-Specific Questions (challenging)
            - 2 Situational Questions
            
            Return ONLY a valid JSON array:
            [
                {
                    "category": "Behavioral" | "Technical" | "Situational",
                    "question": "The interview question",
                    "hint": "Key points a great answer should include"
                }
            ]
            
            Make questions challenging but fair. Return ONLY the JSON array.
        `;

        try {
            console.log('[InterviewPrep] Generating questions for:', jobTitle);

            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error('Generation failed');

            const data = await res.json();

            let cleanResult = data.result.trim();
            if (cleanResult.startsWith('```json')) {
                cleanResult = cleanResult.replace(/```json\n?/, '').replace(/\n?```$/, '');
            } else if (cleanResult.startsWith('```')) {
                cleanResult = cleanResult.replace(/```\n?/, '').replace(/\n?```$/, '');
            }

            const parsed = JSON.parse(cleanResult);
            setQuestions(parsed);
            setCurrentQuestionIndex(0);
            setMode('practice');
            console.log('[InterviewPrep] Generated questions:', parsed.length);
        } catch (err: any) {
            console.error('[InterviewPrep] Error:', err);
            setError(err.message || 'Failed to generate questions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setShowHint(false);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            setShowHint(false);
        }
    };

    const copyAllQuestions = () => {
        const text = questions.map((q, i) =>
            `${i + 1}. [${q.category}] ${q.question}\n   Hint: ${q.hint}`
        ).join('\n\n');
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Behavioral': return 'text-blue-400 bg-blue-500/20';
            case 'Technical': return 'text-purple-400 bg-purple-500/20';
            case 'Situational': return 'text-orange-400 bg-orange-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
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
                    <div className="p-3 bg-pink-500/10 rounded-xl text-pink-500">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Interview Prep AI</h1>
                        <p className="text-gray-400">Practice with AI-generated interview questions tailored to your target role.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6">
                        <ErrorState message={error} onRetry={() => setError(null)} />
                    </div>
                )}

                {mode === 'select' && (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Input Section */}
                        <div className="space-y-6">
                            {/* Job Selection from Applications */}
                            <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                                <label className="block text-sm font-medium mb-2 text-gray-300">
                                    Select from Your Applications
                                </label>
                                {isLoadingJobs ? (
                                    <div className="flex items-center justify-center py-4">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--primary-blue)] border-t-transparent" />
                                    </div>
                                ) : jobs.length === 0 ? (
                                    <p className="text-gray-500 text-sm py-2">No applications found. Enter a job title manually below.</p>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {jobs.map((job) => (
                                            <button
                                                key={job.id}
                                                onClick={() => { setSelectedJob(job); setManualJobTitle(''); }}
                                                className={`w-full text-left p-3 rounded-lg border transition-all ${selectedJob?.id === job.id
                                                    ? 'border-[var(--primary-blue)] bg-[var(--primary-blue)]/10'
                                                    : 'border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--border)]'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4 text-gray-500" />
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

                            <div className="text-center text-gray-500 text-sm">— OR —</div>

                            {/* Manual Entry */}
                            <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                                <label className="block text-sm font-medium mb-2 text-gray-300">Enter Job Title Manually</label>
                                <input
                                    type="text"
                                    value={manualJobTitle}
                                    onChange={(e) => { setManualJobTitle(e.target.value); setSelectedJob(null); }}
                                    className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                    placeholder="e.g. Senior Frontend Engineer"
                                />
                            </div>

                            <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                                <label className="block text-sm font-medium mb-2 text-gray-300">Job Description (Optional)</label>
                                <textarea
                                    value={manualJobDescription}
                                    onChange={(e) => setManualJobDescription(e.target.value)}
                                    disabled={!!selectedJob}
                                    className="w-full h-32 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none resize-none disabled:opacity-50"
                                    placeholder="Paste job description for more targeted questions..."
                                />
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || (!selectedJob && !manualJobTitle)}
                                className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        Generating Questions...
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4" />
                                        Start Practice Session
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Preview */}
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8 flex flex-col items-center justify-center text-center">
                            <MessageSquare className="w-16 h-16 text-gray-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-400 mb-2">Ready to Practice?</h3>
                            <p className="text-gray-500 text-sm max-w-xs">
                                Select a job or enter a role to generate personalized interview questions with AI hints.
                            </p>
                        </div>
                    </div>
                )}

                {mode === 'practice' && questions.length > 0 && (
                    <div className="space-y-6">
                        {/* Progress */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => { setMode('select'); setQuestions([]); }}
                                className="text-gray-400 hover:text-white flex items-center gap-1 text-sm"
                            >
                                <RotateCcw className="w-4 h-4" />
                                New Session
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-sm">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </span>
                                <button
                                    onClick={copyAllQuestions}
                                    className="p-2 bg-[var(--background)] hover:bg-[var(--background-secondary)] rounded-lg text-gray-400 hover:text-white transition-colors"
                                    title="Copy all questions"
                                >
                                    {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[var(--primary-blue)] transition-all"
                                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                            />
                        </div>

                        {/* Current Question */}
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${getCategoryColor(questions[currentQuestionIndex].category)}`}>
                                {questions[currentQuestionIndex].category}
                            </span>

                            <h2 className="text-2xl font-bold text-white mb-6">
                                {questions[currentQuestionIndex].question}
                            </h2>

                            {showHint ? (
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                    <p className="text-sm text-yellow-300 font-medium mb-1">💡 Hint for a great answer:</p>
                                    <p className="text-yellow-200/80 text-sm">{questions[currentQuestionIndex].hint}</p>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowHint(true)}
                                    className="text-[var(--primary-blue)] hover:underline text-sm"
                                >
                                    Show hint
                                </button>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between">
                            <button
                                onClick={prevQuestion}
                                disabled={currentQuestionIndex === 0}
                                className="px-6 py-3 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>
                            <button
                                onClick={nextQuestion}
                                disabled={currentQuestionIndex === questions.length - 1}
                                className="px-6 py-3 bg-[var(--primary-blue)] text-white rounded-lg hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Next Question
                            </button>
                        </div>

                        {/* Question List */}
                        <div className="grid grid-cols-8 gap-2 mt-6">
                            {questions.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setCurrentQuestionIndex(idx); setShowHint(false); }}
                                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${idx === currentQuestionIndex
                                        ? 'bg-[var(--primary-blue)] text-white'
                                        : idx < currentQuestionIndex
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-[var(--background-secondary)] text-gray-400 hover:bg-[var(--background)]'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
