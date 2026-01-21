'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Send, Copy, Check, Search, Briefcase, Globe, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { createClient } from '@/lib/supabase/client';

interface Job {
    id: string;
    title: string;
    requirements: string[];
    location: string | null;
    organization: {
        name: string;
    };
}

export default function BooleanSearchTool() {
    const params = useParams();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [role, setRole] = useState('');
    const [requirements, setRequirements] = useState('');
    const [location, setLocation] = useState('');
    const [platform, setPlatform] = useState<'linkedin' | 'google' | 'github'>('linkedin');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch jobs
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
                    .select(`
                        id,
                        title,
                        requirements,
                        location,
                        organization:organizations(name)
                    `)
                    .eq('organization_id', profile.organization_id)
                    .eq('status', 'published')
                    .order('created_at', { ascending: false });

                const transformed = (jobsData || []).map(job => ({
                    ...job,
                    organization: Array.isArray(job.organization) ? job.organization[0] : job.organization
                }));

                setJobs(transformed);
                console.log('[BooleanSearch] Loaded jobs:', transformed.length);
            } catch (err) {
                console.error('[BooleanSearch] Error:', err);
            } finally {
                setIsLoadingJobs(false);
            }
        };

        fetchJobs();
    }, []);

    const handleSelectJob = (job: Job) => {
        setSelectedJob(job);
        setRole(job.title);
        setRequirements(job.requirements?.join(', ') || '');
        setLocation(job.location || '');
    };

    const handleGenerate = async () => {
        if (!role) {
            setError('Please select a job or enter a target role.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedContent('');

        const platformInfo = {
            linkedin: 'LinkedIn (site:linkedin.com/in)',
            google: 'Google X-Ray Search',
            github: 'GitHub (site:github.com)'
        };

        const prompt = `
            You are an expert technical recruiter and Boolean search specialist.
            Generate precise X-Ray / Boolean search strings for sourcing candidates.
            
            TARGET ROLE: ${role}
            MUST-HAVE SKILLS/REQUIREMENTS: ${requirements || 'Not specified'}
            LOCATION: ${location || 'Any'}
            PRIMARY PLATFORM: ${platformInfo[platform]}
            
            Generate 4 different search string variations:
            
            ## 1. 🎯 Broad Search
            A wider net to capture many potential candidates.
            Explain the strategy.
            
            \`\`\`
            [The actual Boolean string]
            \`\`\`
            
            ## 2. 🔍 Precision Search
            Highly targeted for exact-match candidates.
            Explain the strategy.
            
            \`\`\`
            [The actual Boolean string]
            \`\`\`
            
            ## 3. 💎 Hidden Gem Search
            Find candidates with alternative titles, adjacent skills, or unconventional backgrounds.
            Explain the strategy.
            
            \`\`\`
            [The actual Boolean string]
            \`\`\`
            
            ## 4. 🏢 Company Poach Search
            Target candidates from specific competitor companies (use [COMPANY] placeholder).
            Explain the strategy.
            
            \`\`\`
            [The actual Boolean string]
            \`\`\`
            
            ## 💡 Pro Tips
            - 3 tips for maximizing results with these strings
            - How to modify for different platforms
            
            Make all strings ready to copy-paste directly into ${platform === 'linkedin' ? 'LinkedIn or Google' : platform}.
            Use proper Boolean operators (AND, OR, NOT, "", *, etc.).
        `;

        try {
            console.log('[BooleanSearch] Generating strings for:', role);

            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error('Generation failed');

            const data = await res.json();
            setGeneratedContent(data.result);
            console.log('[BooleanSearch] Strings generated');
        } catch (err: any) {
            console.error('[BooleanSearch] Error:', err);
            setError(err.message || 'Failed to generate search strings.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyCodeBlock = (index: number) => {
        // Extract code blocks from generated content
        const codeBlocks = generatedContent.match(/```[\s\S]*?```/g) || [];
        if (codeBlocks[index]) {
            const code = codeBlocks[index].replace(/```/g, '').trim();
            navigator.clipboard.writeText(code);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        }
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
                        <h1 className="text-3xl font-bold mb-1">Boolean Search Generator</h1>
                        <p className="text-gray-400">Master sourcing with AI-generated X-Ray search strings.</p>
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
                        {jobs.length > 0 && (
                            <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                                <label className="block text-sm font-medium mb-2 text-gray-300">Select from Your Jobs</label>
                                {isLoadingJobs ? (
                                    <div className="flex items-center justify-center py-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--primary-blue)] border-t-transparent" />
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-36 overflow-y-auto">
                                        {jobs.map((job) => (
                                            <button
                                                key={job.id}
                                                onClick={() => handleSelectJob(job)}
                                                className={`w-full text-left p-3 rounded-lg border transition-all ${selectedJob?.id === job.id
                                                    ? 'border-indigo-500 bg-indigo-500/10'
                                                    : 'border-gray-800 bg-[#0b0c0f] hover:border-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4 text-gray-500" />
                                                    <p className="font-medium text-white text-sm">{job.title}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">Target Role</label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => { setRole(e.target.value); setSelectedJob(null); }}
                                className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                placeholder="e.g. Java Architect"
                            />
                        </div>

                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">Must-Have Skills/Keywords</label>
                            <textarea
                                value={requirements}
                                onChange={(e) => setRequirements(e.target.value)}
                                className="w-full h-24 bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none resize-none"
                                placeholder="e.g. Spring Boot, Microservices, 10+ years, Kubernetes"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                                <label className="block text-sm font-medium mb-2 text-gray-300">Location</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                    placeholder="e.g. San Francisco"
                                />
                            </div>

                            <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                                <label className="block text-sm font-medium mb-2 text-gray-300">Platform</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPlatform('linkedin')}
                                        className={`flex-1 p-2 rounded-lg border transition-all ${platform === 'linkedin' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800 bg-[#0b0c0f]'
                                            }`}
                                    >
                                        <Linkedin className="w-5 h-5 mx-auto text-blue-400" />
                                    </button>
                                    <button
                                        onClick={() => setPlatform('google')}
                                        className={`flex-1 p-2 rounded-lg border transition-all ${platform === 'google' ? 'border-green-500 bg-green-500/10' : 'border-gray-800 bg-[#0b0c0f]'
                                            }`}
                                    >
                                        <Globe className="w-5 h-5 mx-auto text-green-400" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !role}
                            className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    Generating...
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4" />
                                    Generate Search Strings
                                </>
                            )}
                        </button>
                    </div>

                    <div className="relative">
                        <div className="h-full min-h-[600px] max-h-[800px] bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8 relative overflow-auto">
                            {generatedContent ? (
                                <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm">
                                    {generatedContent}
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 opacity-50 p-6 text-center">
                                    <Search className="w-16 h-16 mb-4" />
                                    <p className="text-lg">Search strings will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
