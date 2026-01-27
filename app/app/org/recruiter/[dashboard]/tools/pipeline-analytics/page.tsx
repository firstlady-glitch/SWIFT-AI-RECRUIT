'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, TrendingUp, AlertTriangle, Clock, Users, ArrowRight, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { createClient } from '@/lib/supabase/client';

interface PipelineMetrics {
    totalApplications: number;
    statusBreakdown: Record<string, number>;
    avgTimeInStage: Record<string, number>;
    bottlenecks: Array<{ stage: string; count: number; avgDays: number }>;
    predictions: Array<{ applicationId: string; applicantName: string; prediction: string; confidence: number }>;
}

interface PipelineEvent {
    id: string;
    application_id: string;
    event_type: string;
    previous_status: string | null;
    new_status: string | null;
    created_at: string;
    application: {
        id: string;
        status: string;
        applicant: {
            full_name: string | null;
        };
        job: {
            title: string;
        };
    };
}

export default function PipelineAnalyticsTool() {
    const params = useParams();
    const [events, setEvents] = useState<PipelineEvent[]>([]);
    const [metrics, setMetrics] = useState<PipelineMetrics | null>(null);
    const [stalledCandidates, setStalledCandidates] = useState<Array<{
        applicationId: string;
        applicantName: string;
        currentStage: string;
        daysInStage: number;
        jobTitle: string;
    }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch pipeline events
    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Get recruiter's organization
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', user.id)
                    .single();

                if (!profile?.organization_id) {
                    setError('No organization found.');
                    setIsLoading(false);
                    return;
                }

                // Fetch pipeline events
                const { data: eventsData, error: eventsError } = await supabase
                    .from('pipeline_events')
                    .select(`
                        id,
                        application_id,
                        event_type,
                        previous_status,
                        new_status,
                        created_at,
                        application:applications!pipeline_events_application_id_fkey(
                            id,
                            status,
                            applicant:profiles!applications_applicant_id_fkey(full_name),
                            job:jobs!applications_job_id_fkey(title)
                        )
                    `)
                    .eq('event_category', 'stage_change')
                    .order('created_at', { ascending: false })
                    .limit(500);

                if (eventsError) throw eventsError;

                // Transform data - handle nested arrays from Supabase
                const transformed = (eventsData || []).map(ev => {
                    const app = Array.isArray(ev.application) ? ev.application[0] : ev.application;
                    if (!app) return null;

                    // Extract nested data with type safety
                    const applicantData = Array.isArray(app.applicant) ? app.applicant[0] : app.applicant;
                    const jobData = Array.isArray(app.job) ? app.job[0] : app.job;

                    return {
                        ...ev,
                        application: {
                            id: app.id as string,
                            status: app.status as string,
                            applicant: {
                                full_name: (applicantData as { full_name?: string | null })?.full_name ?? null
                            },
                            job: {
                                title: (jobData as { title?: string })?.title ?? ''
                            }
                        }
                    };
                }).filter((ev): ev is PipelineEvent => ev !== null);

                setEvents(transformed);
                console.log('[PipelineAnalytics] Loaded events:', transformed.length);

                // Calculate basic metrics
                calculateMetrics(transformed);
            } catch (err) {
                console.error('[PipelineAnalytics] Error:', err);
                setError('Failed to load pipeline data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const calculateMetrics = (eventsData: PipelineEvent[]) => {
        // Group by status
        const statusCounts: Record<string, number> = {};
        const lastStatusByApp: Record<string, { status: string; timestamp: Date; appName: string; jobTitle: string }> = {};

        eventsData.forEach(ev => {
            if (ev.new_status) {
                statusCounts[ev.new_status] = (statusCounts[ev.new_status] || 0) + 1;

                if (!lastStatusByApp[ev.application_id] || new Date(ev.created_at) > lastStatusByApp[ev.application_id].timestamp) {
                    lastStatusByApp[ev.application_id] = {
                        status: ev.new_status,
                        timestamp: new Date(ev.created_at),
                        appName: ev.application?.applicant?.full_name || 'Unknown',
                        jobTitle: ev.application?.job?.title || 'Unknown'
                    };
                }
            }
        });

        // Find stalled candidates (more than 7 days in a stage)
        const now = new Date();
        const stalled = Object.entries(lastStatusByApp)
            .map(([appId, data]) => ({
                applicationId: appId,
                applicantName: data.appName,
                currentStage: data.status,
                daysInStage: Math.floor((now.getTime() - data.timestamp.getTime()) / (1000 * 60 * 60 * 24)),
                jobTitle: data.jobTitle
            }))
            .filter(c => c.daysInStage >= 7 && !['hired', 'rejected'].includes(c.currentStage))
            .sort((a, b) => b.daysInStage - a.daysInStage)
            .slice(0, 10);

        setStalledCandidates(stalled);

        // Basic metrics
        setMetrics({
            totalApplications: Object.keys(lastStatusByApp).length,
            statusBreakdown: statusCounts,
            avgTimeInStage: {},
            bottlenecks: [],
            predictions: []
        });
    };

    const runAIAnalysis = async () => {
        if (events.length === 0) return;

        setIsAnalyzing(true);
        setError(null);

        const prompt = `
            You are an expert recruiting analytics specialist. Analyze this hiring pipeline data.
            
            PIPELINE EVENTS (last 500):
            Status changes summary:
            ${JSON.stringify(metrics?.statusBreakdown || {}, null, 2)}
            
            STALLED CANDIDATES (stuck 7+ days):
            ${stalledCandidates.map(c => `- ${c.applicantName}: ${c.currentStage} for ${c.daysInStage} days (${c.jobTitle})`).join('\n')}
            
            Total unique applications: ${metrics?.totalApplications || 0}
            
            Analyze the pipeline and provide insights. Return a JSON object:
            {
                "healthScore": number (0-100, overall pipeline health),
                "bottlenecks": [
                    {"stage": "status", "severity": "high|medium|low", "recommendation": "action to take"}
                ],
                "insights": [
                    "insight about the pipeline"
                ],
                "atRiskPredictions": [
                    {"candidate": "name", "stage": "current stage", "risk": "high|medium|low", "reason": "why at risk"}
                ]
            }
            
            Return ONLY the JSON object, no markdown.
        `;

        try {
            console.log('[PipelineAnalytics] Running AI analysis...');

            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error('Analysis failed');

            const data = await res.json();

            let cleanResult = data.result.trim();
            if (cleanResult.startsWith('```json')) {
                cleanResult = cleanResult.replace(/```json\n?/, '').replace(/\n?```$/, '');
            } else if (cleanResult.startsWith('```')) {
                cleanResult = cleanResult.replace(/```\n?/, '').replace(/\n?```$/, '');
            }

            const analysis = JSON.parse(cleanResult);
            console.log('[PipelineAnalytics] Analysis complete:', analysis);

            // Update metrics with AI insights
            setMetrics(prev => prev ? {
                ...prev,
                bottlenecks: analysis.bottlenecks?.map((b: { stage: string; severity: string; recommendation: string }) => ({
                    stage: b.stage,
                    count: 0,
                    avgDays: 0,
                    severity: b.severity,
                    recommendation: b.recommendation
                })) || [],
                predictions: analysis.atRiskPredictions?.map((p: { candidate: string; stage: string; risk: string; reason: string }) => ({
                    applicationId: '',
                    applicantName: p.candidate,
                    prediction: p.reason,
                    confidence: p.risk === 'high' ? 85 : p.risk === 'medium' ? 60 : 30
                })) || [],
                healthScore: analysis.healthScore,
                insights: analysis.insights
            } : null);
        } catch (err: any) {
            console.error('[PipelineAnalytics] Error:', err);
            setError('Failed to run analysis.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'applied': return 'bg-blue-500';
            case 'reviewed': return 'bg-purple-500';
            case 'shortlisted': return 'bg-yellow-500';
            case 'interview': return 'bg-orange-500';
            case 'offer': return 'bg-emerald-500';
            case 'hired': return 'bg-green-500';
            case 'rejected': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-6xl mx-auto">
                <Link
                    href={`/app/org/recruiter/${params.dashboard}/tools`}
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-pink-500/10 rounded-xl text-pink-500">
                            <BarChart3 className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-1">Pipeline Analytics</h1>
                            <p className="text-gray-400">Monitor pipeline velocity and predict candidate churn.</p>
                        </div>
                    </div>
                    <button
                        onClick={runAIAnalysis}
                        disabled={isAnalyzing || events.length === 0}
                        className="px-6 py-3 btn btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                        {isAnalyzing ? (
                            <>
                                Analyzing...
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            </>
                        ) : (
                            <>
                                <TrendingUp className="w-4 h-4" />
                                Run AI Analysis
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mb-6">
                        <ErrorState message={error} onRetry={() => setError(null)} />
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-blue)] border-t-transparent" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Overview Cards */}
                        <div className="grid md:grid-cols-4 gap-4">
                            <div className="p-6 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl">
                                <p className="text-sm text-gray-400 mb-1">Total Applications</p>
                                <p className="text-3xl font-bold text-white">{metrics?.totalApplications || 0}</p>
                            </div>
                            <div className="p-6 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl">
                                <p className="text-sm text-gray-400 mb-1">Active in Pipeline</p>
                                <p className="text-3xl font-bold text-[var(--primary-blue)]">
                                    {Object.entries(metrics?.statusBreakdown || {})
                                        .filter(([s]) => !['hired', 'rejected'].includes(s))
                                        .reduce((sum, [, count]) => sum + count, 0)}
                                </p>
                            </div>
                            <div className="p-6 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl">
                                <p className="text-sm text-gray-400 mb-1">Stalled Candidates</p>
                                <p className="text-3xl font-bold text-orange-400">{stalledCandidates.length}</p>
                            </div>
                            <div className="p-6 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl">
                                <p className="text-sm text-gray-400 mb-1">Health Score</p>
                                <p className={`text-3xl font-bold ${(metrics as PipelineMetrics & { healthScore?: number })?.healthScore
                                    ? (metrics as PipelineMetrics & { healthScore: number }).healthScore >= 70
                                        ? 'text-green-400'
                                        : (metrics as PipelineMetrics & { healthScore: number }).healthScore >= 40
                                            ? 'text-yellow-400'
                                            : 'text-red-400'
                                    : 'text-gray-500'
                                    }`}>
                                    {(metrics as PipelineMetrics & { healthScore?: number })?.healthScore
                                        ? `${(metrics as PipelineMetrics & { healthScore: number }).healthScore}%`
                                        : 'Run analysis'}
                                </p>
                            </div>
                        </div>

                        {/* Pipeline Status Breakdown */}
                        <div className="p-6 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl">
                            <h2 className="text-lg font-semibold mb-4">Pipeline Status Distribution</h2>
                            <div className="flex gap-2 mb-4">
                                {Object.entries(metrics?.statusBreakdown || {}).map(([status, count]) => (
                                    <div key={status} className="flex-1">
                                        <div className={`h-2 ${getStatusColor(status)} rounded-full`}
                                            style={{ opacity: 0.3 + (count / Math.max(...Object.values(metrics?.statusBreakdown || { 1: 1 }))) * 0.7 }}
                                        />
                                        <p className="text-xs text-gray-400 mt-1 capitalize">{status}</p>
                                        <p className="text-sm font-bold text-white">{count}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stalled Candidates Alert */}
                        {stalledCandidates.length > 0 && (
                            <div className="p-6 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                                <div className="flex items-center gap-2 text-orange-400 mb-4">
                                    <AlertTriangle className="w-5 h-5" />
                                    <h2 className="text-lg font-semibold">Candidates Needing Attention</h2>
                                </div>
                                <div className="space-y-3">
                                    {stalledCandidates.map((candidate) => (
                                        <div key={candidate.applicationId} className="flex items-center justify-between p-3 bg-[var(--background-secondary)] rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Users className="w-5 h-5 text-gray-500" />
                                                <div>
                                                    <p className="font-medium text-white">{candidate.applicantName}</p>
                                                    <p className="text-xs text-gray-400">{candidate.jobTitle}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(candidate.currentStage)} bg-opacity-20`}>
                                                    {candidate.currentStage}
                                                </span>
                                                <div className="flex items-center gap-1 text-orange-400">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-sm font-medium">{candidate.daysInStage} days</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* AI Insights */}
                        {(metrics as PipelineMetrics & { insights?: string[] })?.insights && (
                            <div className="p-6 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-[var(--primary-blue)]" />
                                    AI Insights
                                </h2>
                                <ul className="space-y-2">
                                    {(metrics as PipelineMetrics & { insights: string[] }).insights.map((insight, i) => (
                                        <li key={i} className="flex items-start gap-2 text-gray-300">
                                            <ArrowRight className="w-4 h-4 text-[var(--primary-blue)] mt-0.5 shrink-0" />
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Empty State */}
                        {events.length === 0 && !isLoading && (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                <BarChart3 className="w-16 h-16 mb-4 opacity-30" />
                                <p>No pipeline events found. Start processing candidates to see analytics.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
