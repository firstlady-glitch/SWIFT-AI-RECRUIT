'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Brain, Video, FileText, Send, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { createClient } from '@/lib/supabase/client';

interface Interview {
    id: string;
    order_index: number;
    scheduled_at: string;
    status: string;
    recording_url: string | null;
    transcript_url: string | null;
    application: {
        id: string;
        applicant: {
            full_name: string | null;
        };
        job: {
            title: string;
        };
    };
}

interface FeedbackDraft {
    recommendation: 'hire' | 'strong_hire' | 'no_hire' | 'mixed';
    overall_rating: number;
    pros: string[];
    cons: string[];
    notes: string;
    scorecard_metrics: Record<string, number>;
}

export default function InterviewIntelligenceTool() {
    const params = useParams();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [transcriptText, setTranscriptText] = useState('');
    const [feedbackDraft, setFeedbackDraft] = useState<FeedbackDraft | null>(null);
    const [isLoadingInterviews, setIsLoadingInterviews] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Fetch completed interviews
    useEffect(() => {
        const fetchInterviews = async () => {
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
                    setError('No organization found.');
                    setIsLoadingInterviews(false);
                    return;
                }

                // Fetch interviews for organization's jobs
                const { data: interviewsData, error: intError } = await supabase
                    .from('interviews')
                    .select(`
                        id,
                        order_index,
                        scheduled_at,
                        status,
                        recording_url,
                        transcript_url,
                        application:applications!interviews_application_id_fkey(
                            id,
                            applicant:profiles!applications_applicant_id_fkey(full_name),
                            job:jobs!applications_job_id_fkey(title)
                        )
                    `)
                    .eq('status', 'completed')
                    .order('scheduled_at', { ascending: false })
                    .limit(50);

                if (intError) throw intError;

                // Transform data - handle nested arrays from Supabase
                const transformed = (interviewsData || []).map(int => {
                    const app = Array.isArray(int.application) ? int.application[0] : int.application;
                    if (!app) return null;

                    // Extract nested data with type safety
                    const applicantData = Array.isArray(app.applicant) ? app.applicant[0] : app.applicant;
                    const jobData = Array.isArray(app.job) ? app.job[0] : app.job;

                    return {
                        ...int,
                        application: {
                            id: app.id as string,
                            applicant: {
                                full_name: (applicantData as { full_name?: string | null })?.full_name ?? null
                            },
                            job: {
                                title: (jobData as { title?: string })?.title ?? ''
                            }
                        }
                    };
                }).filter((int): int is Interview => int !== null);

                setInterviews(transformed);
                console.log('[InterviewIntelligence] Fetched interviews:', transformed.length);
            } catch (err) {
                console.error('[InterviewIntelligence] Error:', err);
                setError('Failed to load interviews.');
            } finally {
                setIsLoadingInterviews(false);
            }
        };

        fetchInterviews();
    }, []);

    const handleAnalyze = async () => {
        if (!transcriptText.trim()) {
            setError('Please enter or paste the interview transcript.');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setFeedbackDraft(null);

        const candidateName = selectedInterview?.application?.applicant?.full_name || 'the candidate';
        const jobTitle = selectedInterview?.application?.job?.title || 'the position';

        const prompt = `
            You are an expert interviewer and hiring manager. Analyze this interview transcript and provide structured feedback.
            
            CONTEXT:
            - Candidate: ${candidateName}
            - Position: ${jobTitle}
            - Interview Round: ${selectedInterview?.order_index || 1}
            
            TRANSCRIPT:
            ${transcriptText}
            
            Analyze the interview and provide feedback. Return ONLY a valid JSON object:
            {
                "recommendation": "hire" | "strong_hire" | "no_hire" | "mixed",
                "overall_rating": number (1-5),
                "pros": ["strength1", "strength2", "strength3"],
                "cons": ["concern1", "concern2"],
                "notes": "2-3 sentence summary of the interview and key observations",
                "scorecard_metrics": {
                    "Technical Skills": number (1-5),
                    "Communication": number (1-5),
                    "Problem Solving": number (1-5),
                    "Cultural Fit": number (1-5),
                    "Experience Relevance": number (1-5)
                }
            }
            
            Be balanced and fair. Identify both strengths and areas for improvement.
            Return ONLY the JSON object, no markdown or additional text.
        `;

        try {
            console.log('[InterviewIntelligence] Analyzing transcript...');

            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error('Analysis failed');

            const data = await res.json();

            // Parse JSON
            let cleanResult = data.result.trim();
            if (cleanResult.startsWith('```json')) {
                cleanResult = cleanResult.replace(/```json\n?/, '').replace(/\n?```$/, '');
            } else if (cleanResult.startsWith('```')) {
                cleanResult = cleanResult.replace(/```\n?/, '').replace(/\n?```$/, '');
            }

            const parsed = JSON.parse(cleanResult);
            console.log('[InterviewIntelligence] Analysis complete:', parsed);
            setFeedbackDraft(parsed);
        } catch (err: any) {
            console.error('[InterviewIntelligence] Error:', err);
            setError(err.message || 'Failed to analyze transcript.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSaveFeedback = async () => {
        if (!feedbackDraft || !selectedInterview) return;

        setIsSaving(true);
        setError(null);

        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error: insertError } = await supabase
                .from('interview_feedback')
                .insert({
                    interview_id: selectedInterview.id,
                    reviewer_id: user.id,
                    recommendation: feedbackDraft.recommendation,
                    overall_rating: feedbackDraft.overall_rating,
                    pros: feedbackDraft.pros,
                    cons: feedbackDraft.cons,
                    notes: feedbackDraft.notes,
                    scorecard_metrics: feedbackDraft.scorecard_metrics
                });

            if (insertError) throw insertError;

            console.log('[InterviewIntelligence] Feedback saved');
            setSaveSuccess(true);
        } catch (err: any) {
            console.error('[InterviewIntelligence] Save error:', err);
            setError(err.message || 'Failed to save feedback.');
        } finally {
            setIsSaving(false);
        }
    };

    const getRecommendationConfig = (rec: string) => {
        switch (rec) {
            case 'strong_hire':
                return { icon: ThumbsUp, color: 'text-green-400 bg-green-500/20', label: 'Strong Hire' };
            case 'hire':
                return { icon: ThumbsUp, color: 'text-emerald-400 bg-emerald-500/20', label: 'Hire' };
            case 'no_hire':
                return { icon: ThumbsDown, color: 'text-red-400 bg-red-500/20', label: 'No Hire' };
            default:
                return { icon: Minus, color: 'text-yellow-400 bg-yellow-500/20', label: 'Mixed' };
        }
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
                    <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500">
                        <Brain className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Interview Intelligence</h1>
                        <p className="text-gray-400">AI-powered analysis and feedback generation for interviews.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6">
                        <ErrorState message={error} onRetry={() => setError(null)} />
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        {/* Interview Selection */}
                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">
                                Select Interview (Optional)
                            </label>
                            {isLoadingInterviews ? (
                                <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--primary-blue)] border-t-transparent" />
                                </div>
                            ) : interviews.length === 0 ? (
                                <p className="text-gray-500 text-sm">No completed interviews found.</p>
                            ) : (
                                <select
                                    value={selectedInterview?.id || ''}
                                    onChange={(e) => {
                                        const int = interviews.find(i => i.id === e.target.value);
                                        setSelectedInterview(int || null);
                                    }}
                                    className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                >
                                    <option value="">-- Select an interview --</option>
                                    {interviews.map((int) => (
                                        <option key={int.id} value={int.id}>
                                            {int.application?.applicant?.full_name || 'Unknown'} - {int.application?.job?.title} (Round {int.order_index})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Transcript Input */}
                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">
                                Interview Transcript
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                Paste the interview transcript or notes for AI analysis.
                            </p>
                            <textarea
                                value={transcriptText}
                                onChange={(e) => setTranscriptText(e.target.value)}
                                className="w-full h-64 bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none resize-none font-mono"
                                placeholder="Interviewer: Can you tell me about your experience with React?

Candidate: I've been working with React for about 4 years now. In my current role at TechCorp, I've built several large-scale applications...

Interviewer: What's the most challenging project you've worked on?"
                            />
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !transcriptText.trim()}
                            className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isAnalyzing ? (
                                <>
                                    Analyzing...
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                </>
                            ) : (
                                <>
                                    <Brain className="w-4 h-4" />
                                    Analyze Interview
                                </>
                            )}
                        </button>
                    </div>

                    {/* Feedback Draft */}
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4">AI-Generated Feedback</h2>

                        {feedbackDraft ? (
                            <div className="space-y-4">
                                {/* Recommendation */}
                                <div className={`p-4 rounded-lg flex items-center gap-3 ${getRecommendationConfig(feedbackDraft.recommendation).color}`}>
                                    {(() => {
                                        const Icon = getRecommendationConfig(feedbackDraft.recommendation).icon;
                                        return <Icon className="w-6 h-6" />;
                                    })()}
                                    <div>
                                        <p className="text-xs opacity-70">Recommendation</p>
                                        <p className="font-bold text-lg">
                                            {getRecommendationConfig(feedbackDraft.recommendation).label}
                                        </p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <p className="text-xs opacity-70">Overall Rating</p>
                                        <p className="font-bold text-2xl">{feedbackDraft.overall_rating}/5</p>
                                    </div>
                                </div>

                                {/* Scorecard */}
                                <div className="p-4 bg-[#0b0c0f] rounded-lg border border-gray-800">
                                    <p className="text-sm text-gray-400 mb-3">Scorecard</p>
                                    <div className="space-y-2">
                                        {Object.entries(feedbackDraft.scorecard_metrics).map(([metric, score]) => (
                                            <div key={metric} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-300">{metric}</span>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((n) => (
                                                        <div
                                                            key={n}
                                                            className={`w-4 h-4 rounded ${n <= score ? 'bg-[var(--primary-blue)]' : 'bg-gray-700'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pros */}
                                <div className="p-4 bg-[#0b0c0f] rounded-lg border border-gray-800">
                                    <p className="text-sm text-green-400 mb-2">Strengths</p>
                                    <ul className="space-y-1">
                                        {feedbackDraft.pros.map((pro, i) => (
                                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                <span className="text-green-500">+</span>
                                                {pro}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Cons */}
                                <div className="p-4 bg-[#0b0c0f] rounded-lg border border-gray-800">
                                    <p className="text-sm text-orange-400 mb-2">Areas for Concern</p>
                                    <ul className="space-y-1">
                                        {feedbackDraft.cons.map((con, i) => (
                                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                <span className="text-orange-500">-</span>
                                                {con}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Notes */}
                                <div className="p-4 bg-[#0b0c0f] rounded-lg border border-gray-800">
                                    <p className="text-sm text-gray-400 mb-2">Summary Notes</p>
                                    <p className="text-sm text-gray-300">{feedbackDraft.notes}</p>
                                </div>

                                {/* Save Button */}
                                {selectedInterview && !saveSuccess && (
                                    <button
                                        onClick={handleSaveFeedback}
                                        disabled={isSaving}
                                        className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                                    >
                                        {isSaving ? (
                                            <>
                                                Saving...
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Save Feedback to Database
                                            </>
                                        )}
                                    </button>
                                )}

                                {saveSuccess && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-center">
                                        ✓ Feedback saved successfully!
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                <Brain className="w-16 h-16 mb-4 opacity-30" />
                                <p className="text-center">Paste an interview transcript and click analyze to generate feedback.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
