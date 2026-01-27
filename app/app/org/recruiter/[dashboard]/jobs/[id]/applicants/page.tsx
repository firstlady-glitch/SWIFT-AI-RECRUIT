'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    ArrowLeft, Search, Filter, Sparkles, MoreHorizontal,
    Download, ExternalLink, Calendar, MapPin, Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import type { Application, Job, Profile } from '@/types';

type SortOption = 'ai_score' | 'name' | 'date';

export default function RecruiterApplicantsPage() {
    const params = useParams();
    const [job, setJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<(Application & { applicant: Profile })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>('ai_score');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const supabase = createClient();

        try {
            // Fetch Job Details
            const { data: jobData } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', params.id)
                .single();

            setJob(jobData);

            // Fetch Applications with Applicant Profiles
            const { data: appsData, error: appsError } = await supabase
                .from('applications')
                .select(`
                    *,
                    applicant:profiles(*)
                `)
                .eq('job_id', params.id);

            if (appsError) throw appsError;

            // Ensure applicant data is correctly typed and attached
            const processedApps = (appsData || []).map(app => ({
                ...app,
                applicant: Array.isArray(app.applicant) ? app.applicant[0] : app.applicant
            })).filter(app => app.applicant);

            setApplications(processedApps);

        } catch (err: any) {
            console.error('Error fetching applicants:', err);
            setError('Failed to load applicants.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyzeAI = async () => {
        if (!job || applications.length === 0) return;

        setIsAnalyzing(true);
        const supabase = createClient();

        try {
            const appsToAnalyze = applications;

            for (const app of appsToAnalyze) {
                if (!app.applicant) continue;

                const prompt = `
                    You are an expert ATS (Applicant Tracking System) and Hiring Manager.
                    Analyze this candidate for the following job.

                    JOB TITLE: ${job.title}
                    JOB DESCRIPTION: 
                    ${job.description.substring(0, 1000)}...

                    CANDIDATE:
                    Name: ${app.applicant.full_name}
                    Role: ${app.applicant.job_title}
                    Experience: ${app.applicant.experience_years} years
                    Skills: ${app.applicant.skills?.join(', ')}
                    Cover Letter: ${app.cover_letter ? app.cover_letter.substring(0, 500) : 'None'}

                    Task:
                    1. Assign a Match Score from 0 to 100 based on fit.
                    2. Provide 3 short reason phrases for the score.

                    Return ONLY a JSON object:
                    {
                        "score": number,
                        "reasons": ["reason 1", "reason 2", "reason 3"]
                    }
                `;

                try {
                    const res = await fetch('/api/ai/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt })
                    });

                    const data = await res.json();
                    let cleanJson = data.result.replace(/```json/g, '').replace(/```/g, '').trim();
                    const analysis = JSON.parse(cleanJson);

                    // Update Database
                    await supabase
                        .from('applications')
                        .update({
                            score: analysis.score,
                            match_reasons: analysis.reasons
                        })
                        .eq('id', app.id);

                } catch (e) {
                    console.error('Analysis failed for:', app.id, e);
                }
            }

            // Refresh data
            fetchData();

        } catch (err) {
            console.error('AI Analysis batch error:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getSortedApplications = () => {
        let sorted = [...applications];

        // Filter
        if (filterStatus !== 'all') {
            sorted = sorted.filter(app => app.status === filterStatus);
        }

        // Sort
        sorted.sort((a, b) => {
            switch (sortBy) {
                case 'ai_score':
                    return (b.score || 0) - (a.score || 0);
                case 'name':
                    return (a.applicant?.full_name || '').localeCompare(b.applicant?.full_name || '');
                case 'date':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                default:
                    return 0;
            }
        });

        return sorted;
    };

    const getScoreColor = (score: number | null) => {
        if (!score) return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        if (score >= 90) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        if (score >= 70) return 'bg-green-500/10 text-green-400 border-green-500/20';
        if (score >= 50) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        return 'bg-red-500/10 text-red-400 border-red-500/20';
    };

    const sortedApps = getSortedApplications();

    if (isLoading) return <div className="p-8"><LoadingState type="list" count={5} /></div>;
    if (error) return <div className="p-8"><ErrorState message={error} /></div>;

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-7xl mx-auto">
                <Link
                    href={`/app/org/recruiter/${params.dashboard}/jobs`}
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Jobs
                </Link>

                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">{job?.title}</h1>
                        <p className="text-gray-400">Recruiter Pipeline</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleAnalyzeAI}
                            disabled={isAnalyzing || applications.length === 0}
                            className="btn bg-[var(--primary-purple)] hover:bg-purple-600 text-white border-0 flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all disabled:opacity-50"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Analyze with AI
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Filters & Controls */}
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                className="pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary-blue)] w-64"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Filter className="w-4 h-4" />
                            <span>{sortedApps.length} applicants</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                        <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
                        <div className="flex p-1 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                            <button
                                onClick={() => setSortBy('ai_score')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-all ${sortBy === 'ai_score' ? 'bg-[var(--primary-purple)]/10 text-[var(--primary-purple)] font-medium' : 'text-gray-400 hover:text-white'}`}
                            >
                                AI Match
                            </button>
                            <button
                                onClick={() => setSortBy('date')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-all ${sortBy === 'date' ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)] font-medium' : 'text-gray-400 hover:text-white'}`}
                            >
                                Newest
                            </button>
                            <button
                                onClick={() => setSortBy('name')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-all ${sortBy === 'name' ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)] font-medium' : 'text-gray-400 hover:text-white'}`}
                            >
                                Name (A-Z)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Applicants List */}
                <div className="space-y-4">
                    {sortedApps.map((app) => (
                        <div
                            key={app.id}
                            className="group bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--primary-blue)]/50 transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Left: Profile Info */}
                                <div className="flex gap-4 lg:w-1/3">
                                    <div className="w-12 h-12 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-lg font-bold text-gray-500 shrink-0">
                                        {app.applicant?.full_name?.[0] || '?'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{app.applicant?.full_name}</h3>
                                        <p className="text-[var(--primary-blue)] text-sm mb-1">{app.applicant?.job_title || 'No Title'}</p>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            {app.applicant?.experience_years !== null && (
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="w-3 h-3" /> {app.applicant.experience_years}y exp
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Middle: AI Score & Analysis */}
                                <div className="lg:w-1/3 border-l border-[var(--border)] pl-0 lg:pl-6 border-t lg:border-t-0 pt-4 lg:pt-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-sm font-medium text-gray-400">Match Score</div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getScoreColor(app.score)}`}>
                                            {app.score ? `${app.score}%` : 'N/A'}
                                        </div>
                                    </div>

                                    {app.match_reasons && app.match_reasons.length > 0 ? (
                                        <ul className="space-y-1">
                                            {app.match_reasons.map((reason, i) => (
                                                <li key={i} className="text-xs text-gray-400 flex items-start gap-1.5">
                                                    <span className="text-[var(--primary-green)] mt-0.5">•</span>
                                                    {reason}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-gray-500 italic">
                                            Run AI analysis to see insights.
                                        </p>
                                    )}
                                </div>

                                {/* Right: Status & Actions */}
                                <div className="lg:w-1/3 flex flex-col justify-between items-end gap-4 border-l border-[var(--border)] pl-0 lg:pl-6 border-t lg:border-t-0 pt-4 lg:pt-0">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--background)] border border-[var(--border)] text-gray-400 uppercase tracking-wide">
                                            {app.status}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Applied {new Date(app.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        {app.resume_version_url && (
                                            <a
                                                href={app.resume_version_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-400 hover:text-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/10 rounded-lg transition-colors"
                                                title="View Resume"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </a>
                                        )}
                                        <button className="btn btn-outline text-xs px-4 py-2">View Details</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {sortedApps.length === 0 && (
                        <div className="text-center py-20 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)]">
                            <div className="w-16 h-16 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-300">No applicants found</h3>
                            <p className="text-gray-500 text-sm mt-1">Wait for candidates to apply.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}