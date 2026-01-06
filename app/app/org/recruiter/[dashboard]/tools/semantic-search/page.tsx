'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Search, User, Briefcase, MapPin, Mail } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { createClient } from '@/lib/supabase/client';

interface CandidateResult {
    id: string;
    full_name: string | null;
    email: string | null;
    job_title: string | null;
    location: string | null;
    experience_years: number | null;
    skills: string[] | null;
    relevanceScore: number;
    matchReason: string;
}

export default function SemanticSearchTool() {
    const params = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [allProfiles, setAllProfiles] = useState<Array<{
        id: string;
        full_name: string | null;
        email: string | null;
        job_title: string | null;
        location: string | null;
        experience_years: number | null;
        skills: string[] | null;
    }>>([]);
    const [results, setResults] = useState<CandidateResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load profiles on mount
    useEffect(() => {
        const fetchProfiles = async () => {
            const supabase = createClient();

            try {
                const { data, error: fetchError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, job_title, location, experience_years, skills')
                    .eq('role', 'applicant')
                    .limit(100);

                if (fetchError) throw fetchError;
                setAllProfiles(data || []);
                console.log('[SemanticSearch] Loaded profiles:', data?.length);
            } catch (err) {
                console.error('[SemanticSearch] Error loading profiles:', err);
                setError('Failed to load candidate database.');
            } finally {
                setIsLoadingProfiles(false);
            }
        };

        fetchProfiles();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setError(null);
        setResults([]);

        // Build candidate data for AI matching
        const candidatesForAI = allProfiles.map(p => ({
            id: p.id,
            name: p.full_name || 'Unknown',
            title: p.job_title || 'Not specified',
            location: p.location || 'Unknown',
            experience: p.experience_years || 0,
            skills: p.skills || []
        }));

        const prompt = `
            You are an expert recruiter performing a semantic candidate search.
            
            SEARCH QUERY:
            "${searchQuery}"
            
            CANDIDATE DATABASE:
            ${JSON.stringify(candidatesForAI, null, 2)}
            
            Match candidates based on semantic understanding, not just keywords.
            Consider:
            - Similar skills (React ≈ Frontend, JavaScript ≈ TypeScript)
            - Related job titles (Software Engineer ≈ Developer)
            - Location context (if mentioned)
            - Experience level implications
            
            Return the TOP 10 most relevant candidates as a JSON array:
            [
                {
                    "id": "profile_id",
                    "relevanceScore": number (0-100),
                    "matchReason": "brief reason why this candidate matches"
                }
            ]
            
            Order by relevanceScore descending.
            Only include candidates with relevanceScore >= 30.
            Return ONLY the JSON array, no markdown.
        `;

        try {
            console.log('[SemanticSearch] Searching for:', searchQuery);

            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error('Search failed');

            const data = await res.json();

            // Parse JSON
            let cleanResult = data.result.trim();
            if (cleanResult.startsWith('```json')) {
                cleanResult = cleanResult.replace(/```json\n?/, '').replace(/\n?```$/, '');
            } else if (cleanResult.startsWith('```')) {
                cleanResult = cleanResult.replace(/```\n?/, '').replace(/\n?```$/, '');
            }

            const rankings: Array<{ id: string; relevanceScore: number; matchReason: string }> = JSON.parse(cleanResult);

            // Merge with full profile data
            const enrichedResults: CandidateResult[] = rankings
                .map(r => {
                    const profile = allProfiles.find(p => p.id === r.id);
                    if (!profile) return null;
                    return {
                        ...profile,
                        relevanceScore: r.relevanceScore,
                        matchReason: r.matchReason
                    };
                })
                .filter((r): r is CandidateResult => r !== null);

            setResults(enrichedResults);
            console.log('[SemanticSearch] Found matches:', enrichedResults.length);
        } catch (err: any) {
            console.error('[SemanticSearch] Error:', err);
            setError(err.message || 'Search failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400 bg-green-500/20';
        if (score >= 60) return 'text-yellow-400 bg-yellow-500/20';
        if (score >= 40) return 'text-orange-400 bg-orange-500/20';
        return 'text-gray-400 bg-gray-500/20';
    };

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-5xl mx-auto">
                <Link
                    href={`/app/org/recruiter/${params.dashboard}/tools`}
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                        <Search className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Semantic Candidate Search</h1>
                        <p className="text-gray-400">Find candidates using natural language queries.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6">
                        <ErrorState message={error} onRetry={() => setError(null)} />
                    </div>
                )}

                {/* Search Input */}
                <div className="mb-8">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full bg-[#15171e] border border-gray-800 rounded-xl p-4 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                placeholder="e.g., React developers in London with fintech experience"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={isLoading || isLoadingProfiles || !searchQuery.trim()}
                            className="px-8 btn btn-primary flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    Searching...
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4" />
                                    Search
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {isLoadingProfiles
                            ? 'Loading candidate database...'
                            : `${allProfiles.length} candidates in database`
                        }
                    </p>
                </div>

                {/* Search Examples */}
                {results.length === 0 && !isLoading && (
                    <div className="mb-8 p-6 bg-[#15171e] border border-gray-800 rounded-xl">
                        <p className="text-sm text-gray-400 mb-3">Try searches like:</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                'Senior Python developers with AWS experience',
                                'Marketing managers in New York',
                                'Full-stack engineers with startup experience',
                                'Data scientists who know machine learning'
                            ].map((example, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSearchQuery(example)}
                                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition-colors"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Results */}
                {results.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-300">
                            Found {results.length} matching candidates
                        </h2>

                        {results.map((candidate) => (
                            <div
                                key={candidate.id}
                                className="p-5 bg-[#15171e] border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white text-lg">
                                                {candidate.full_name || 'Unknown'}
                                            </h3>
                                            <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                                                {candidate.job_title && (
                                                    <span className="flex items-center gap-1">
                                                        <Briefcase className="w-3 h-3" />
                                                        {candidate.job_title}
                                                    </span>
                                                )}
                                                {candidate.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {candidate.location}
                                                    </span>
                                                )}
                                                {candidate.experience_years && (
                                                    <span>{candidate.experience_years} years exp</span>
                                                )}
                                            </div>

                                            {/* Skills */}
                                            {candidate.skills && candidate.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-3">
                                                    {candidate.skills.slice(0, 6).map((skill, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {candidate.skills.length > 6 && (
                                                        <span className="text-xs text-gray-500">+{candidate.skills.length - 6}</span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Match Reason */}
                                            <p className="text-sm text-indigo-400 mt-2">
                                                {candidate.matchReason}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(candidate.relevanceScore)}`}>
                                            {candidate.relevanceScore}% match
                                        </div>
                                        {candidate.email && (
                                            <a
                                                href={`mailto:${candidate.email}`}
                                                className="flex items-center gap-1 text-sm text-[var(--primary-blue)] hover:underline"
                                            >
                                                <Mail className="w-3 h-3" />
                                                Contact
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* No Results */}
                {results.length === 0 && !isLoading && searchQuery && (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                        <Search className="w-16 h-16 mb-4 opacity-30" />
                        <p>No matching candidates found. Try a different search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
