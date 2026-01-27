'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Building2, Sparkles, Send, MapPin, Briefcase, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import type { Job, Profile } from '@/types';

export default function ApplyPage() {
    const params = useParams();
    const router = useRouter();
    const [job, setJob] = useState<Job | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            try {
                // Get current user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/login');
                    return;
                }

                // Fetch Profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                setProfile(profileData);

                // Fetch Job
                const { data: jobData, error: jobError } = await supabase
                    .from('jobs')
                    .select(`
                        *,
                        organization:organizations(*)
                    `)
                    .eq('id', params.id)
                    .single();

                if (jobError) throw jobError;
                setJob(jobData);

            } catch (err: any) {
                console.error('Error loading application data:', err);
                setError('Failed to load job details. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [params.id, router]);

    const handleGenerateCoverLetter = async () => {
        if (!job || !profile) return;

        setIsGenerating(true);
        setError(null);

        const prompt = `
            Write a professional cover letter for a job application.
            
            CANDIDATE:
            Name: ${profile.full_name || 'Candidate'}
            Role: ${profile.job_title || 'Professional'}
            Experience: ${profile.experience_years || 0} years
            Skills: ${profile.skills?.join(', ') || 'N/A'}
            
            TARGET JOB:
            Role: ${job.title}
            Company: ${job.organization?.name || 'Company'}
            Description: ${job.description.substring(0, 500)}...
            
            REQUIREMENTS:
            Strictly format as plain text.
            - NO markdown characters (no #, **, __, etc).
            - NO bullet points or lists.
            - NO special dashes (use standard hyphens only).
            - NO placeholders like [Date] or [Address].
            - Keep it under 250 words.
            - Professional, enthusiastic, and direct tone.
        `;

        try {
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error('Failed to generate cover letter');

            const data = await res.json();
            // Clean up any residual markdown just in case
            let cleanText = data.result
                .replace(/[*#_`]/g, '')
                .replace(/—/g, '-')
                .trim();

            setCoverLetter(cleanText);
        } catch (err: any) {
            setError(err.message || 'Failed to generate cover letter');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async () => {
        if (!coverLetter.trim()) {
            setError('Please include a cover letter.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const supabase = createClient();

            // Check if already applied
            const { data: existingApp } = await supabase
                .from('applications')
                .select('id')
                .eq('job_id', job?.id)
                .eq('applicant_id', profile?.id)
                .single();

            if (existingApp) {
                throw new Error('You have already applied to this job.');
            }

            const { error: submitError } = await supabase
                .from('applications')
                .insert({
                    job_id: job?.id,
                    applicant_id: profile?.id,
                    cover_letter: coverLetter,
                    status: 'applied',
                    resume_version_url: profile?.resume_url
                });

            if (submitError) throw submitError;

            setSuccess(true);
            setTimeout(() => {
                router.push('/app/applicant/applications');
            }, 2000);

        } catch (err: any) {
            console.error('Submission error:', err);
            setError(err.message || 'Failed to submit application.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-8"><LoadingState type="card" count={1} /></div>;
    if (!job) return <div className="p-8"><ErrorState message="Job not found" /></div>;

    if (success) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-2xl p-12 text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Application Sent!</h2>
                    <p className="text-gray-400 mb-8">
                        Your application for {job.title} has been submitted successfully.
                    </p>
                    <Link
                        href="/app/applicant/applications"
                        className="btn btn-primary w-full py-3 flex items-center justify-center"
                    >
                        View My Applications
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)] p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Job
                </button>

                {error && (
                    <div className="mb-6 animate-in slide-in-from-top-2">
                        <ErrorState message={error} onRetry={() => setError(null)} />
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Job Details Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-[var(--border)]">
                                    {job.organization?.logo_url ? (
                                        <img src={job.organization.logo_url} alt={job.organization.name} className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <Building2 className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg leading-tight mb-1">{job.organization?.name}</h3>
                                    <p className="text-sm text-gray-400">{job.organization?.industry}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Applying For</p>
                                    <h2 className="text-xl font-bold text-[var(--primary-blue)]">{job.title}</h2>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    {job.location || 'Remote'}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Briefcase className="w-4 h-4 text-gray-500" />
                                    {job.type}
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--background-secondary)]/50 border border-[var(--border)] rounded-xl p-6">
                            <h4 className="font-medium text-white mb-3">Your Profile Snapshot</h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Name</span>
                                    <span className="text-gray-300">{profile?.full_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Experience</span>
                                    <span className="text-gray-300">{profile?.experience_years} Years</span>
                                </div>
                                <div className="pt-3 border-t border-[var(--border)]">
                                    <span className="text-gray-500 block mb-2">Resume</span>
                                    {profile?.resume_url ? (
                                        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Attached
                                        </div>
                                    ) : (
                                        <div className="text-red-400 bg-red-500/10 px-3 py-2 rounded-lg text-center">
                                            Missing Resume
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Application Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-2xl font-bold text-white">Cover Letter</h1>
                                <button
                                    onClick={handleGenerateCoverLetter}
                                    disabled={isGenerating}
                                    className="btn border border-[var(--primary-purple)]/50 bg-[var(--primary-purple)]/10 text-[var(--primary-purple)] hover:bg-[var(--primary-purple)]/20 flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent" />
                                            Writing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Generate with AI
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className="text-gray-400 text-sm mb-4">
                                Introduce yourself and explain why you're a great fit for this role.
                            </p>

                            <textarea
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                className="w-full h-96 bg-[var(--background)] border border-[var(--border)] rounded-xl p-6 text-sm leading-relaxed focus:border-[var(--primary-blue)] focus:outline-none resize-none font-sans"
                                placeholder="Dear Hiring Manager..."
                            />

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !coverLetter.trim()}
                                    className="btn btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            Submitting...
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        </>
                                    ) : (
                                        <>
                                            Submit Application
                                            <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
