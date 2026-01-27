'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Sparkles, Send, Copy, Check, Save, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { createClient } from '@/lib/supabase/client';

interface GeneratedJD {
    description: string;
    requirements: string[];
    suggestedSalaryMin: number;
    suggestedSalaryMax: number;
}

export default function JobDescriptionTool() {
    const params = useParams();
    const [title, setTitle] = useState('');
    const [keywords, setKeywords] = useState('');
    const [location, setLocation] = useState('');
    const [jobType, setJobType] = useState('Full-time');
    const [generatedJD, setGeneratedJD] = useState<GeneratedJD | null>(null);
    const [rawContent, setRawContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [organization, setOrganization] = useState<any>(null);

    useEffect(() => {
        const fetchOrg = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (profile?.organization_id) {
                const { data: org } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('id', profile.organization_id)
                    .single();

                if (org) {
                    setOrganization(org);
                    if (org.location) {
                        setLocation(org.location);
                    }
                }
            }
        };
        fetchOrg();
    }, []);

    const handleGenerate = async () => {
        if (!title) return;

        setIsLoading(true);
        setError(null);
        setGeneratedJD(null);
        setRawContent('');

        const prompt = `
            You are an expert HR specialist and compensation analyst.
            Generate a comprehensive Job Description for a ${title}.
            
            Organization: ${organization?.name || 'Unknown Company'}
            ${organization?.description ? `About the Company: ${organization.description}` : ''}
            ${organization?.industry ? `Industry: ${organization.industry}` : ''}

            Keywords/Requirements to include: ${keywords || 'Not specified'}
            Location: ${location || 'Remote'}
            Job Type: ${jobType}
            
            Return ONLY a valid JSON object:
            {
                "description": "Full job description with sections: Role Summary, Key Responsibilities (bullet points), Required Qualifications, Preferred Qualifications, Why Join Us. Use markdown formatting.",
                "requirements": ["requirement1", "requirement2", "requirement3", ...],
                "suggestedSalaryMin": number (annual salary in USD based on market rates for this role and location),
                "suggestedSalaryMax": number (annual salary in USD based on market rates for this role and location)
            }
            
            Make the description professional, inclusive, and exciting.
            Base salary suggestions on current market rates for the role, experience level, and location.
            Return ONLY the JSON object, no markdown or additional text.
        `;

        try {
            console.log('[JDGenerator] Generating job description...');

            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error('Generation failed');

            const data = await res.json();

            // Parse JSON
            let cleanResult = data.result.trim();
            if (cleanResult.startsWith('```json')) {
                cleanResult = cleanResult.replace(/```json\n?/, '').replace(/\n?```$/, '');
            } else if (cleanResult.startsWith('```')) {
                cleanResult = cleanResult.replace(/```\n?/, '').replace(/\n?```$/, '');
            }

            const parsed = JSON.parse(cleanResult);
            console.log('[JDGenerator] Generated successfully');
            setGeneratedJD(parsed);
            setRawContent(parsed.description);
        } catch (err: any) {
            console.error('[JDGenerator] Error:', err);
            setError(err.message || 'Failed to generate job description.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveToJobs = async () => {
        if (!generatedJD || !title) return;

        setIsSaving(true);
        setError(null);

        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Get user's organization
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!profile?.organization_id) {
                throw new Error('No organization found. Please set up your organization first.');
            }

            const { error: insertError } = await supabase
                .from('jobs')
                .insert({
                    organization_id: profile.organization_id,
                    posted_by: user.id,
                    title: title,
                    description: generatedJD.description,
                    requirements: generatedJD.requirements,
                    salary_range_min: generatedJD.suggestedSalaryMin,
                    salary_range_max: generatedJD.suggestedSalaryMax,
                    location: location || 'Remote',
                    type: jobType,
                    status: 'draft'
                });

            if (insertError) throw insertError;

            console.log('[JDGenerator] Job saved as draft');
            setSaveSuccess(true);
        } catch (err: any) {
            console.error('[JDGenerator] Save error:', err);
            setError(err.message || 'Failed to save job.');
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(rawContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-5xl mx-auto">
                <Link
                    href={`/app/org/employer/${params.dashboard}/tools`}
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-[var(--primary-blue)]/10 rounded-xl text-[var(--primary-blue)]">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Job Description Generator</h1>
                        <p className="text-gray-400">Create professional JDs with AI-suggested salary ranges.</p>
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
                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">Job Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                placeholder="e.g. Senior React Developer"
                            />
                        </div>

                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">Location</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                placeholder="e.g. New York, NY or Remote"
                            />
                        </div>

                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">Job Type</label>
                            <select
                                value={jobType}
                                onChange={(e) => setJobType(e.target.value)}
                                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                            >
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Contract</option>
                                <option>Freelance</option>
                                <option>Internship</option>
                            </select>
                        </div>

                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">Key Requirements / Keywords</label>
                            <textarea
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                className="w-full h-24 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none resize-none"
                                placeholder="e.g. TypeScript, Node.js, 5+ years experience, remote..."
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !title}
                            className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    Generating...
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Generate Description
                                </>
                            )}
                        </button>
                    </div>

                    {/* Output Section */}
                    <div className="space-y-4">
                        {generatedJD ? (
                            <>
                                {/* Salary Suggestion */}
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                        <DollarSign className="w-5 h-5" />
                                        <span className="font-medium">Suggested Salary Range</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        ${generatedJD.suggestedSalaryMin.toLocaleString()} - ${generatedJD.suggestedSalaryMax.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-emerald-400/70 mt-1">
                                        Based on market rates for {title} in {location || 'Remote'}
                                    </p>
                                </div>

                                {/* Requirements Pills */}
                                <div className="p-4 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg">
                                    <p className="text-sm text-gray-400 mb-2">Extracted Requirements</p>
                                    <div className="flex flex-wrap gap-2">
                                        {generatedJD.requirements.slice(0, 10).map((req, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-[var(--primary-blue)]/10 text-[var(--primary-blue)] rounded text-xs">
                                                {req}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="relative bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute top-4 right-4 p-2 bg-[var(--background)] hover:bg-[var(--background-secondary)] rounded-lg text-gray-400 hover:text-white transition-colors"
                                    >
                                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm max-h-96 overflow-y-auto">
                                        {generatedJD.description}
                                    </div>
                                </div>

                                {/* Save Button */}
                                {!saveSuccess ? (
                                    <button
                                        onClick={handleSaveToJobs}
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
                                                <Save className="w-4 h-4" />
                                                Save as Draft Job
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-center">
                                        ✓ Job saved as draft! You can publish it from your jobs dashboard.
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-full min-h-[500px] bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8 flex flex-col items-center justify-center text-[var(--foreground-secondary)] opacity-50">
                                <Sparkles className="w-16 h-16 mb-4" />
                                <p className="text-lg">Generated JD will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
