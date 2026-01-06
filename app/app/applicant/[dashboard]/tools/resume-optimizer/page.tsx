'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Sparkles, Send, Copy, Check, RefreshCw, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { createClient } from '@/lib/supabase/client';

interface Profile {
    job_title: string | null;
    skills: string[] | null;
    experience_years: number | null;
}

interface Job {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    organization: {
        name: string;
    };
}

export default function ResumeOptimizerTool() {
    const params = useParams();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [resumeContent, setResumeContent] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [useProfileData, setUseProfileData] = useState(false);

    // Fetch profile and jobs
    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoadingData(false);
                    return;
                }

                // Fetch profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('job_title, skills, experience_years')
                    .eq('id', user.id)
                    .single();

                if (profileData) {
                    setProfile(profileData);
                }

                // Fetch published jobs for targeting
                const { data: jobsData } = await supabase
                    .from('jobs')
                    .select(`
                        id,
                        title,
                        description,
                        requirements,
                        organization:organizations(name)
                    `)
                    .eq('status', 'published')
                    .limit(30);

                const transformed = (jobsData || []).map(job => ({
                    ...job,
                    organization: Array.isArray(job.organization) ? job.organization[0] : job.organization
                }));

                setJobs(transformed);
                console.log('[ResumeOptimizer] Loaded profile and jobs');
            } catch (err) {
                console.error('[ResumeOptimizer] Error:', err);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const handleUseProfile = () => {
        if (!profile) return;

        const profileText = `
Current Role: ${profile.job_title || 'Not specified'}
Experience: ${profile.experience_years || 0} years
Skills: ${profile.skills?.join(', ') || 'Not specified'}
        `.trim();

        setResumeContent(profileText);
        setUseProfileData(true);
    };

    const handleGenerate = async () => {
        if (!resumeContent) {
            setError('Please enter your resume content or use your profile data.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedContent('');

        const role = selectedJob?.title || targetRole || 'General Professional';
        const jobRequirements = selectedJob?.requirements?.join(', ') || '';
        const jobDescription = selectedJob?.description || '';

        const prompt = `
            You are an expert resume reviewer and ATS optimization specialist.
            Review the following resume content for the target role of "${role}".
            
            RESUME CONTENT:
            ${resumeContent}
            
            ${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n` : ''}
            ${jobRequirements ? `KEY REQUIREMENTS:\n${jobRequirements}\n` : ''}

            Provide a comprehensive analysis including:
            
            ## 📊 ATS Score Estimate
            Rate the resume's ATS compatibility (0-100) and explain why.
            
            ## ✨ Summary/Objective Improvements
            Rewrite a stronger professional summary tailored to the target role.
            
            ## 💪 Bullet Point Enhancements
            Provide 5 examples of how to strengthen experience bullets using:
            - Action verbs
            - Quantifiable achievements
            - Results-oriented language
            
            ## 🔑 Missing Keywords
            List 10 keywords from the job requirements that should be added.
            
            ## 📋 Formatting Tips
            Provide 3-5 specific formatting improvements.
            
            ## 🎯 Tailored Recommendations
            3 specific suggestions to better match this exact role.
            
            Format the response with clear headings and be specific.
        `;

        try {
            console.log('[ResumeOptimizer] Analyzing resume for:', role);

            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error('Analysis failed');

            const data = await res.json();
            setGeneratedContent(data.result);
            console.log('[ResumeOptimizer] Analysis complete');
        } catch (err: any) {
            console.error('[ResumeOptimizer] Error:', err);
            setError(err.message || 'Failed to analyze resume. Please try again.');
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
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Resume Optimizer</h1>
                        <p className="text-gray-400">Get AI-powered feedback to improve your resume for specific roles.</p>
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
                        {/* Quick Actions */}
                        {profile && (profile.job_title || profile.skills) && (
                            <div className="card p-4 border border-gray-800 bg-[#15171e]">
                                <button
                                    onClick={handleUseProfile}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--primary-blue)]/10 text-[var(--primary-blue)] rounded-lg hover:bg-[var(--primary-blue)]/20 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Use My Profile Data
                                </button>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    Quickly analyze based on your current profile information
                                </p>
                            </div>
                        )}

                        {/* Target Job Selection */}
                        <div className="card p-6 border border-gray-800 bg-[#15171e]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">Target Job (Optional)</label>
                            {isLoadingData ? (
                                <div className="flex items-center justify-center py-3">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--primary-blue)] border-t-transparent" />
                                </div>
                            ) : (
                                <select
                                    value={selectedJob?.id || ''}
                                    onChange={(e) => {
                                        const job = jobs.find(j => j.id === e.target.value);
                                        setSelectedJob(job || null);
                                        if (job) setTargetRole('');
                                    }}
                                    className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                >
                                    <option value="">-- Select a published job --</option>
                                    {jobs.map((job) => (
                                        <option key={job.id} value={job.id}>
                                            {job.title} at {job.organization?.name || 'Unknown'}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {!selectedJob && (
                            <div className="card p-6 border border-gray-800 bg-[#15171e]">
                                <label className="block text-sm font-medium mb-2 text-gray-300">Or Enter Target Role</label>
                                <input
                                    type="text"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                    placeholder="e.g. Senior Product Manager"
                                />
                            </div>
                        )}

                        <div className="card p-6 border border-gray-800 bg-[#15171e]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">
                                Your Resume Content
                                {useProfileData && <span className="text-[var(--primary-blue)] ml-2">(Using profile data)</span>}
                            </label>
                            <textarea
                                value={resumeContent}
                                onChange={(e) => { setResumeContent(e.target.value); setUseProfileData(false); }}
                                className="w-full h-64 bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none resize-none font-mono"
                                placeholder="Paste the text from your resume here..."
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !resumeContent}
                            className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    Analyzing...
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Optimize Resume
                                </>
                            )}
                        </button>
                    </div>

                    {/* Output Section */}
                    <div className="relative">
                        <div className="h-full min-h-[600px] bg-[#15171e] border border-gray-800 rounded-xl p-8 relative overflow-auto">
                            {generatedContent ? (
                                <>
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
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
                                    <Sparkles className="w-16 h-16 mb-4" />
                                    <p className="text-lg">AI optimization feedback will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
