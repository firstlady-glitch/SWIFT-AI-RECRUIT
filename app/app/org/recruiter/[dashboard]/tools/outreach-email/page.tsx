'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Send, Copy, Check, Mail, User, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { createClient } from '@/lib/supabase/client';

interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
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

export default function OutreachEmailTool() {
    const params = useParams();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [hook, setHook] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recruiter, setRecruiter] = useState<{ full_name: string | null; job_title: string | null; organization_name: string } | null>(null);

    // Fetch profiles and jobs
    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            try {
                // Fetch candidate profiles
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, job_title, skills, experience_years')
                    .eq('role', 'applicant')
                    .limit(100);

                setProfiles(profilesData || []);

                // Fetch current user (recruiter) details
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name, job_title, organization_id')
                        .eq('id', user.id)
                        .single();

                    if (profile) {
                        let orgName = 'Our Company';
                        if (profile.organization_id) {
                            const { data: org } = await supabase
                                .from('organizations')
                                .select('name')
                                .eq('id', profile.organization_id)
                                .single();
                            if (org) orgName = org.name;
                        }
                        setRecruiter({ ...profile, organization_name: orgName });
                    }
                }

                // Fetch published jobs
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
                console.log('[OutreachEmail] Loaded profiles:', profilesData?.length, 'jobs:', transformed.length);
            } catch (err) {
                console.error('[OutreachEmail] Error:', err);
                setError('Failed to load data.');
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const handleGenerate = async () => {
        if (!selectedProfile) {
            setError('Please select a candidate.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedContent('');

        const candidateInfo = `
            Name: ${selectedProfile.full_name || 'Unknown'}
            Current Role: ${selectedProfile.job_title || 'Not specified'}
            Skills: ${selectedProfile.skills?.join(', ') || 'Not specified'}
            Experience: ${selectedProfile.experience_years || 'Unknown'} years
        `;

        const jobInfo = selectedJob
            ? `Role: ${selectedJob.title} at ${selectedJob.organization?.name || 'our company'}`
            : 'General opportunity inquiry';

        const prompt = `
            You are an expert recruiter writing a cold outreach email.
            
            SENDER INFO:
            Name: ${recruiter?.full_name || 'Recruiter'}
            Title: ${recruiter?.job_title || 'Talent Acquisition'}
            Company: ${recruiter?.organization_name || 'Company'}
            
            CANDIDATE INFO:
            ${candidateInfo}
            
            TARGET OPPORTUNITY:
            ${jobInfo}
            
            PERSONAL HOOK/CONTEXT:
            ${hook || 'No specific hook provided'}
            
            Write a hyper-personalized outreach email that:
            1. Opens with something specific about THEM (use their skills or background)
            2. Briefly mentions the opportunity without being salesy
            3. Ends with a clear, low-friction CTA (quick call, reply, etc.)
            4. Is under 150 words
            5. Sounds human, not templated
            
            Include a subject line at the top.
        `;

        try {
            console.log('[OutreachEmail] Generating email for:', selectedProfile.full_name);

            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error('Generation failed');

            const data = await res.json();
            setGeneratedContent(data.result);
            console.log('[OutreachEmail] Email generated');
        } catch (err: any) {
            console.error('[OutreachEmail] Error:', err);
            setError(err.message || 'Failed to generate email.');
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
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                        <Mail className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Outreach Email Generator</h1>
                        <p className="text-gray-400">Create personalized emails using candidate profile data.</p>
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
                        {/* Candidate Selection */}
                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                Select Candidate
                            </label>
                            {isLoadingData ? (
                                <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--primary-blue)] border-t-transparent" />
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {profiles.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No candidates found.</p>
                                    ) : (
                                        profiles.map((profile) => (
                                            <button
                                                key={profile.id}
                                                onClick={() => setSelectedProfile(profile)}
                                                className={`w-full text-left p-3 rounded-lg border transition-all ${selectedProfile?.id === profile.id
                                                    ? 'border-[var(--primary-blue)] bg-[var(--primary-blue)]/10'
                                                    : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--border)]'
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
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Selected Candidate Info */}
                        {selectedProfile && (
                            <div className="p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg">
                                <p className="text-sm text-gray-400 mb-2">Selected Candidate</p>
                                <p className="font-medium text-white">{selectedProfile.full_name}</p>
                                <p className="text-sm text-gray-400">{selectedProfile.job_title} • {selectedProfile.experience_years} yrs</p>
                                {selectedProfile.skills && selectedProfile.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {selectedProfile.skills.slice(0, 5).map((skill, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground-secondary)] rounded text-xs">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Job Selection */}
                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                Target Job (Optional)
                            </label>
                            <select
                                value={selectedJob?.id || ''}
                                onChange={(e) => {
                                    const job = jobs.find(j => j.id === e.target.value);
                                    setSelectedJob(job || null);
                                }}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                            >
                                <option value="">-- Select a job --</option>
                                {jobs.map((job) => (
                                    <option key={job.id} value={job.id}>
                                        {job.title} at {job.organization?.name || 'Unknown'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Personal Hook */}
                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">
                                Personal Hook / Context
                            </label>
                            <textarea
                                value={hook}
                                onChange={(e) => setHook(e.target.value)}
                                className="w-full h-24 bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none resize-none"
                                placeholder="e.g., Saw their talk at ReactConf, their open-source project..."
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !selectedProfile}
                            className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    Generating...
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                </>
                            ) : (
                                <>
                                    Generate Email
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
                                    <Mail className="w-16 h-16 mb-4" />
                                    <p className="text-lg">Personalized email will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
