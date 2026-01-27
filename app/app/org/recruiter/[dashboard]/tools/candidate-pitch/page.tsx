'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Send, Copy, Check, Presentation, User, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { createClient } from '@/lib/supabase/client';

interface Profile {
    id: string;
    full_name: string | null;
    job_title: string | null;
    skills: string[] | null;
    experience_years: number | null;
}

interface Job {
    id: string;
    title: string;
    organization: {
        name: string;
    };
}

export default function CandidatePitchTool() {
    const params = useParams();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [candidateName, setCandidateName] = useState('');
    const [keySkills, setKeySkills] = useState('');
    const [pitchStyle, setPitchStyle] = useState<'email' | 'slack' | 'presentation'>('email');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recruiter, setRecruiter] = useState<{ full_name: string | null; job_title: string | null } | null>(null);

    // Fetch candidates and jobs
    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            try {
                // Fetch applicant profiles
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, full_name, job_title, skills, experience_years')
                    .eq('role', 'applicant')
                    .limit(100);

                setProfiles(profilesData || []);

                // Fetch current user (recruiter) details
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name, job_title')
                        .eq('id', user.id)
                        .single();
                    if (profile) setRecruiter(profile);
                }

                // Fetch jobs
                const { data: jobsData } = await supabase
                    .from('jobs')
                    .select(`
                        id,
                        title,
                        organization:organizations(name)
                    `)
                    .eq('status', 'published')
                    .limit(50);

                const transformed = (jobsData || []).map(job => ({
                    ...job,
                    organization: Array.isArray(job.organization) ? job.organization[0] : job.organization
                }));

                setJobs(transformed);
                console.log('[CandidatePitch] Loaded profiles and jobs');
            } catch (err) {
                console.error('[CandidatePitch] Error:', err);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const handleSelectProfile = (profile: Profile) => {
        setSelectedProfile(profile);
        setCandidateName(profile.full_name || '');
        setKeySkills(`
${profile.job_title || 'Professional'}
${profile.experience_years ? `${profile.experience_years} years of experience` : ''}
Skills: ${profile.skills?.join(', ') || 'Various'}
        `.trim());
    };

    const handleGenerate = async () => {
        if (!candidateName) {
            setError('Please select a candidate or enter their name.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedContent('');

        const targetRole = selectedJob?.title || 'the open position';
        const company = selectedJob?.organization?.name || 'your company';

        const styleInstructions = {
            email: 'Format as a professional email to a hiring manager. Include a subject line. Keep it concise (under 200 words).',
            slack: 'Format as a Slack message. Use emojis sparingly. Be casual but professional. Very brief (under 100 words).',
            presentation: 'Format as bullet points for a verbal pitch or slide deck. Include talking points and key data.'
        };

        const prompt = `
            You are an expert recruiter pitching a candidate to a hiring manager.
            
            CANDIDATE:
            Name: ${candidateName}
            Background: ${keySkills}
            
            TARGET ROLE: ${targetRole} at ${company}
            FORMAT: ${styleInstructions[pitchStyle]}
            
            Create a compelling candidate pitch that:
            
            1. **Opens with a hook** - One impactful sentence that grabs attention
            2. **Highlights top 3 selling points** - Why this person is special
            3. **Addresses the role fit** - How they match this specific opportunity
            4. **Creates urgency** - Why you shouldn't wait to interview them
            5. **Clear CTA** - What action the hiring manager should take next
            
            Tone: Persuasive, confident, data-driven where possible.
            
            ${pitchStyle === 'email' ? `
            Also provide:
            - A catchy subject line
            - 2 alternative opening hooks
            ` : ''}
            
            ${pitchStyle === 'presentation' ? `
            Also provide:
            - 5-7 bullet points for a slide
            - 3 potential objections and how to handle them
            ` : ''}
            
            Make the hiring manager want to meet this candidate TODAY.
            
            Sender: ${recruiter?.full_name || 'Recruiter'}, ${recruiter?.job_title || ''}
        `;

        try {
            console.log('[CandidatePitch] Generating pitch for:', candidateName);

            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error('Generation failed');

            const data = await res.json();
            setGeneratedContent(data.result);
            console.log('[CandidatePitch] Pitch generated');
        } catch (err: any) {
            console.error('[CandidatePitch] Error:', err);
            setError(err.message || 'Failed to generate pitch.');
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
                    href={`/app/org/recruiter/${params.dashboard}/tools`}
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                        <Presentation className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Candidate Pitch Generator</h1>
                        <p className="text-gray-400">Sell your candidates to clients with compelling pitches.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6">
                        <ErrorState message={error} onRetry={() => setError(null)} />
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        {/* Candidate Selection */}
                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">Select Candidate</label>
                            {isLoadingData ? (
                                <div className="flex items-center justify-center py-3">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--primary-blue)] border-t-transparent" />
                                </div>
                            ) : profiles.length === 0 ? (
                                <p className="text-gray-500 text-sm">No candidates found</p>
                            ) : (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {profiles.map((profile) => (
                                        <button
                                            key={profile.id}
                                            onClick={() => handleSelectProfile(profile)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${selectedProfile?.id === profile.id
                                                ? 'border-orange-500 bg-orange-500/10'
                                                : 'border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--border)]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <div>
                                                    <p className="font-medium text-white text-sm">{profile.full_name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-400">{profile.job_title || 'No title'}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Target Job */}
                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">Target Job (Optional)</label>
                            <select
                                value={selectedJob?.id || ''}
                                onChange={(e) => {
                                    const job = jobs.find(j => j.id === e.target.value);
                                    setSelectedJob(job || null);
                                }}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                            >
                                <option value="">-- General pitch --</option>
                                {jobs.map((job) => (
                                    <option key={job.id} value={job.id}>
                                        {job.title} at {job.organization?.name || 'Unknown'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">Candidate Name</label>
                            <input
                                type="text"
                                value={candidateName}
                                onChange={(e) => { setCandidateName(e.target.value); setSelectedProfile(null); }}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                placeholder="Sam Taylor"
                            />
                        </div>

                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">Key Skills & Experience</label>
                            <textarea
                                value={keySkills}
                                onChange={(e) => setKeySkills(e.target.value)}
                                className="w-full h-28 bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none resize-none"
                                placeholder="e.g. 5 yrs in React, led team of 10, built SaaS from 0 to 1M ARR."
                            />
                        </div>

                        {/* Pitch Style */}
                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-3 text-gray-300">Pitch Style</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => setPitchStyle('email')}
                                    className={`p-3 rounded-lg border text-center transition-all ${pitchStyle === 'email' ? 'border-orange-500 bg-orange-500/10' : 'border-[var(--border)] bg-[var(--background-secondary)]'
                                        }`}
                                >
                                    <p className="text-sm font-medium text-white">Email</p>
                                    <p className="text-xs text-gray-500">Formal</p>
                                </button>
                                <button
                                    onClick={() => setPitchStyle('slack')}
                                    className={`p-3 rounded-lg border text-center transition-all ${pitchStyle === 'slack' ? 'border-orange-500 bg-orange-500/10' : 'border-[var(--border)] bg-[var(--background-secondary)]'
                                        }`}
                                >
                                    <p className="text-sm font-medium text-white">Slack</p>
                                    <p className="text-xs text-gray-500">Quick</p>
                                </button>
                                <button
                                    onClick={() => setPitchStyle('presentation')}
                                    className={`p-3 rounded-lg border text-center transition-all ${pitchStyle === 'presentation' ? 'border-orange-500 bg-orange-500/10' : 'border-[var(--border)] bg-[var(--background-secondary)]'
                                        }`}
                                >
                                    <p className="text-sm font-medium text-white">Deck</p>
                                    <p className="text-xs text-gray-500">Slides</p>
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !candidateName}
                            className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    Generating...
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                </>
                            ) : (
                                <>
                                    <Presentation className="w-4 h-4" />
                                    Generate Pitch
                                </>
                            )}
                        </button>
                    </div>

                    <div className="relative">
                        <div className="h-full min-h-[600px] bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8 relative overflow-auto">
                            {generatedContent ? (
                                <>
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute top-4 right-4 p-2 bg-[var(--background)] hover:bg-[var(--background-secondary)] rounded-lg text-gray-400 hover:text-white transition-colors z-10"
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
                                    <Presentation className="w-16 h-16 mb-4" />
                                    <p className="text-lg">Candidate pitch will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
