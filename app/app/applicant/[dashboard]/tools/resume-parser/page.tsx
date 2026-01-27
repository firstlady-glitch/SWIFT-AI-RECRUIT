'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, Send, Upload, Check, User, Briefcase, Code, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { createClient } from '@/lib/supabase/client';

interface ProfileData {
    resume_url: string | null;
    job_title: string | null;
    experience_years: number | null;
    skills: string[] | null;
}

export default function ResumeParserTool() {
    const params = useParams();
    const [mode, setMode] = useState<'choose' | 'existing' | 'new'>('choose');
    const [existingResume, setExistingResume] = useState<ProfileData | null>(null);
    const [resumeText, setResumeText] = useState('');
    const [parsedData, setParsedData] = useState<{
        job_title: string;
        experience_years: number;
        skills: string[];
        summary: string;
    } | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Fetch existing profile/resume data
    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoadingProfile(false);
                    return;
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('resume_url, job_title, experience_years, skills')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setExistingResume(profile);
                    console.log('[ResumeParser] Found existing profile:', profile);
                }
            } catch (err) {
                console.error('[ResumeParser] Error fetching profile:', err);
            } finally {
                setIsLoadingProfile(false);
            }
        };

        fetchProfile();
    }, []);

    const handleUseExisting = async () => {
        if (!existingResume?.resume_url) {
            setError('No existing resume found. Please upload a new one.');
            return;
        }

        setMode('existing');
        setIsLoading(true);
        setError(null);

        try {
            // Fetch the resume content from storage
            const supabase = createClient();
            const { data, error: downloadError } = await supabase.storage
                .from('resumes')
                .download(existingResume.resume_url);

            if (downloadError) throw downloadError;

            // For text-based parsing, we'll read the file content
            const text = await data.text();
            setResumeText(text);

            // Auto-parse
            await parseResumeContent(text);
        } catch (err: any) {
            console.error('[ResumeParser] Error fetching resume:', err);
            // If we can't download, show existing profile data if available
            if (existingResume?.job_title || existingResume?.skills) {
                setParsedData({
                    job_title: existingResume.job_title || 'Not specified',
                    experience_years: existingResume.experience_years || 0,
                    skills: existingResume.skills || [],
                    summary: 'Profile data from your existing registration.'
                });
            } else {
                setError('Could not load resume. Please paste your resume text manually.');
                setMode('new');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const parseResumeContent = async (content: string) => {
        const prompt = `
            You are an expert resume parser. Analyze the following resume and extract structured data.
            
            RESUME CONTENT:
            ${content}
            
            Extract and return ONLY a valid JSON object with these exact fields:
            {
                "job_title": "Most recent or most relevant job title",
                "experience_years": number (total years of professional experience),
                "skills": ["skill1", "skill2", ...] (list of technical and soft skills),
                "summary": "A brief 2-3 sentence professional summary"
            }
            
            Return ONLY the JSON object, no additional text or markdown formatting.
        `;

        const res = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();

        // Parse the JSON response
        let cleanResult = data.result.trim();
        if (cleanResult.startsWith('```json')) {
            cleanResult = cleanResult.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanResult.startsWith('```')) {
            cleanResult = cleanResult.replace(/```\n?/, '').replace(/\n?```$/, '');
        }

        const parsed = JSON.parse(cleanResult);
        console.log('[ResumeParser] Successfully parsed resume data:', parsed);
        setParsedData(parsed);
    };

    const handleParse = async () => {
        if (!resumeText.trim()) return;

        setIsLoading(true);
        setError(null);
        setParsedData(null);

        try {
            console.log('[ResumeParser] Starting resume analysis...');
            await parseResumeContent(resumeText);
        } catch (err: any) {
            console.error('[ResumeParser] Error:', err);
            setError(err.message || 'Failed to parse resume. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveToProfile = async () => {
        if (!parsedData) return;

        setIsSaving(true);
        setError(null);

        try {
            console.log('[ResumeParser] Saving to profile...', parsedData);

            const res = await fetch('/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_title: parsedData.job_title,
                    experience_years: parsedData.experience_years,
                    skills: parsedData.skills,
                    onboarding_completed: true
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            console.log('[ResumeParser] Profile updated successfully');
            setSaveSuccess(true);
        } catch (err: any) {
            console.error('[ResumeParser] Save error:', err);
            setError(err.message || 'Failed to save to profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const hasExistingData = existingResume?.resume_url || existingResume?.job_title || (existingResume?.skills && existingResume.skills.length > 0);

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
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Smart Resume Parser</h1>
                        <p className="text-gray-400">Extract your profile data from your resume automatically.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6">
                        <ErrorState message={error} onRetry={() => setError(null)} />
                    </div>
                )}

                {/* Mode Selection */}
                {mode === 'choose' && !isLoadingProfile && (
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Use Existing Resume */}
                        <button
                            onClick={handleUseExisting}
                            disabled={!hasExistingData}
                            className={`p-8 border rounded-xl text-left transition-all ${hasExistingData
                                ? 'border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--primary-blue)] cursor-pointer'
                                : 'border-[var(--border)] bg-[var(--background-secondary)] opacity-50 cursor-not-allowed'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-[var(--primary-blue)]/10 rounded-xl">
                                    <RefreshCw className="w-6 h-6 text-[var(--primary-blue)]" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Continue with Existing</h3>
                            </div>
                            <p className="text-gray-400 text-sm mb-4">
                                Use the resume you uploaded during registration to update your profile.
                            </p>
                            {hasExistingData ? (
                                <div className="text-xs text-green-400 flex items-center gap-1">
                                    <Check className="w-4 h-4" />
                                    Resume found in your account
                                </div>
                            ) : (
                                <div className="text-xs text-gray-500">
                                    No existing resume found
                                </div>
                            )}
                        </button>

                        {/* Upload New Resume */}
                        <button
                            onClick={() => setMode('new')}
                            className="p-8 border border-[var(--border)] bg-[var(--background-secondary)] rounded-xl text-left hover:border-emerald-500 transition-all"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl">
                                    <Upload className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Paste New Resume</h3>
                            </div>
                            <p className="text-gray-400 text-sm mb-4">
                                Copy and paste fresh resume content to update your profile with new information.
                            </p>
                            <div className="text-xs text-emerald-400">
                                Recommended for updated resumes
                            </div>
                        </button>
                    </div>
                )}

                {isLoadingProfile && mode === 'choose' && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-blue)] border-t-transparent" />
                    </div>
                )}

                {/* Main Content */}
                {(mode === 'new' || mode === 'existing') && (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Input Section */}
                        <div className="space-y-6">
                            {mode === 'new' && (
                                <>
                                    <button
                                        onClick={() => { setMode('choose'); setParsedData(null); setResumeText(''); }}
                                        className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                                    >
                                        <ArrowLeft className="w-3 h-3" />
                                        Back to options
                                    </button>

                                    <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                                        <label className="block text-sm font-medium mb-2 text-gray-300">
                                            Paste Your Resume Content
                                        </label>
                                        <p className="text-xs text-gray-500 mb-3">
                                            Copy and paste the text from your resume document below.
                                        </p>
                                        <textarea
                                            value={resumeText}
                                            onChange={(e) => setResumeText(e.target.value)}
                                            className="w-full h-80 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-4 text-sm focus:border-[var(--primary-blue)] focus:outline-none resize-none font-mono"
                                            placeholder="John Doe
Senior Software Engineer
john.doe@email.com | (555) 123-4567

PROFESSIONAL SUMMARY
Experienced software engineer with 8+ years...

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2020 - Present
- Led development of microservices architecture...

SKILLS
JavaScript, TypeScript, React, Node.js, Python..."
                                        />
                                    </div>

                                    <button
                                        onClick={handleParse}
                                        disabled={isLoading || !resumeText.trim()}
                                        className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                                    >
                                        {isLoading ? (
                                            <>
                                                Analyzing Resume...
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                Parse Resume
                                            </>
                                        )}
                                    </button>
                                </>
                            )}

                            {mode === 'existing' && isLoading && (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-blue)] border-t-transparent mb-4" />
                                    <p>Loading your existing resume...</p>
                                </div>
                            )}
                        </div>

                        {/* Output Section */}
                        <div className="space-y-6">
                            <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-[var(--primary-blue)]" />
                                    Extracted Profile Data
                                </h2>

                                {parsedData ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-[var(--background-secondary)] rounded-lg border border-[var(--border)]">
                                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                                                <Briefcase className="w-4 h-4" />
                                                Job Title
                                            </div>
                                            <p className="text-white font-medium">{parsedData.job_title}</p>
                                        </div>

                                        <div className="p-4 bg-[var(--background-secondary)] rounded-lg border border-[var(--border)]">
                                            <div className="text-sm text-gray-400 mb-1">Years of Experience</div>
                                            <p className="text-white font-medium text-2xl">{parsedData.experience_years}</p>
                                        </div>

                                        <div className="p-4 bg-[var(--background-secondary)] rounded-lg border border-[var(--border)]">
                                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                                <Code className="w-4 h-4" />
                                                Skills
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {parsedData.skills.map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1 bg-[var(--primary-blue)]/10 text-[var(--primary-blue)] rounded-full text-sm"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-[var(--background-secondary)] rounded-lg border border-[var(--border)]">
                                            <div className="text-sm text-gray-400 mb-1">Professional Summary</div>
                                            <p className="text-gray-300 text-sm">{parsedData.summary}</p>
                                        </div>

                                        {saveSuccess ? (
                                            <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
                                                <Check className="w-5 h-5" />
                                                Profile updated successfully!
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleSaveToProfile}
                                                disabled={isSaving}
                                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        Saving...
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-4 h-4" />
                                                        Save to My Profile
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                        <FileText className="w-16 h-16 mb-4 opacity-30" />
                                        <p className="text-center">
                                            {mode === 'new'
                                                ? 'Paste your resume and click "Parse Resume" to extract your profile data.'
                                                : 'Loading your profile data...'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
