'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Send, Copy, Check, FileText, User, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';
import { ErrorState } from '@/components/ui/ErrorState';
import { createClient } from '@/lib/supabase/client';

interface Application {
    id: string;
    status: string;
    applicant: {
        id: string;
        full_name: string | null;
        email: string | null;
    };
    job: {
        id: string;
        title: string;
    };
}

interface Organization {
    name: string;
}

export default function OfferLetterTool() {
    const params = useParams();
    const [applications, setApplications] = useState<Application[]>([]);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [candidateName, setCandidateName] = useState('');
    const [candidateEmail, setCandidateEmail] = useState('');
    const [role, setRole] = useState('');
    const [salary, setSalary] = useState('');
    const [startDate, setStartDate] = useState('');
    const [benefits, setBenefits] = useState('Health insurance, 401k matching, unlimited PTO');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sender, setSender] = useState<{ full_name: string | null; job_title: string | null } | null>(null);

    // Fetch applications with offer status or interviews completed
    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoadingData(false);
                    return;
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', user.id)
                    .single();

                if (!profile?.organization_id) {
                    setIsLoadingData(false);
                    return;
                }

                // Get organization info
                const { data: orgData } = await supabase
                    .from('organizations')
                    .select('name')
                    .eq('id', profile.organization_id)
                    .single();

                setOrganization(orgData);

                // Fetch current user (sender) details
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name, job_title')
                        .eq('id', user.id)
                        .single();
                    if (profile) setSender(profile);
                }

                // Get applications that are at offer stage or shortlisted
                const { data: appsData } = await supabase
                    .from('applications')
                    .select(`
                        id,
                        status,
                        applicant:profiles!applications_applicant_id_fkey(id, full_name, email),
                        job:jobs!applications_job_id_fkey(id, title)
                    `)
                    .in('status', ['offer', 'shortlisted', 'interview'])
                    .order('updated_at', { ascending: false })
                    .limit(50);

                const transformed = (appsData || []).map(app => ({
                    ...app,
                    applicant: Array.isArray(app.applicant) ? app.applicant[0] : app.applicant,
                    job: Array.isArray(app.job) ? app.job[0] : app.job
                })).filter(app => app.applicant && app.job);

                setApplications(transformed);
                console.log('[OfferLetter] Loaded applications:', transformed.length);
            } catch (err) {
                console.error('[OfferLetter] Error:', err);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const handleSelectApplication = (app: Application) => {
        setSelectedApplication(app);
        setCandidateName(app.applicant?.full_name || '');
        setCandidateEmail(app.applicant?.email || '');
        setRole(app.job?.title || '');
    };

    const handleGenerate = async () => {
        if (!candidateName || !role) {
            setError('Please enter candidate name and role.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedContent('');

        const companyName = organization?.name || 'Our Company';

        const prompt = `
            Write a professional and warm employment offer letter.
            
            DETAILS:
            - Company: ${companyName}
            - Candidate: ${candidateName}
            - Email: ${candidateEmail || 'N/A'}
            - Role: ${role}
            - Compensation: ${salary || 'Competitive market rate'}
            - Proposed Start Date: ${startDate || 'To be discussed'}
            - Benefits: ${benefits}
            
            Create a complete offer letter that includes:
            
            1. **Warm Opening** - Excitement about extending the offer
            2. **Position Details** - Title, reporting structure, location
            3. **Compensation Package**
               - Base salary
               - Any bonus/equity (mention if applicable)
               - Benefits summary
            4. **Start Date** - Proposed date with flexibility mention
            5. **At-Will Employment** - Standard clause
            6. **Acceptance Instructions** - How to accept (sign and return)
            7. **Response Deadline** - 5 business days to respond
            8. **Closing** - Enthusiasm about them joining
            9. **Signature Block** - ${sender?.full_name || '[Hiring Manager Name]'}, ${sender?.job_title || '[Title]'}
            
            Tone: Professional, welcoming, and enthusiastic.
            Format as a proper letter with today's date.
            Include placeholders in [BRACKETS] for any information that needs to be filled in.
        `;

        try {
            console.log('[OfferLetter] Generating offer for:', candidateName);

            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error('Generation failed');

            const data = await res.json();
            setGeneratedContent(data.result);
            console.log('[OfferLetter] Offer letter generated');
        } catch (err: any) {
            console.error('[OfferLetter] Error:', err);
            setError(err.message || 'Failed to generate offer letter.');
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
                    href={`/app/org/employer/${params.dashboard}/tools`}
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Offer Letter Generator</h1>
                        <p className="text-gray-400">Create professional offer letters for your top candidates.</p>
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
                        {applications.length > 0 && (
                            <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                                <label className="block text-sm font-medium mb-2 text-gray-300">
                                    Select from Pipeline
                                </label>
                                {isLoadingData ? (
                                    <div className="flex items-center justify-center py-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--primary-blue)] border-t-transparent" />
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {applications.map((app) => (
                                            <button
                                                key={app.id}
                                                onClick={() => handleSelectApplication(app)}
                                                className={`w-full text-left p-3 rounded-lg border transition-all ${selectedApplication?.id === app.id
                                                    ? 'border-green-500 bg-green-500/10'
                                                    : 'border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--border)]'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-500" />
                                                        <div>
                                                            <p className="font-medium text-white text-sm">{app.applicant?.full_name}</p>
                                                            <p className="text-xs text-gray-400">{app.job?.title}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded text-xs capitalize ${app.status === 'offer' ? 'bg-green-500/20 text-green-400' :
                                                        app.status === 'interview' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Manual Entry */}
                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)] space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Candidate Name</label>
                                <input
                                    type="text"
                                    value={candidateName}
                                    onChange={(e) => setCandidateName(e.target.value)}
                                    className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                    placeholder="Jane Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Role Title</label>
                                <input
                                    type="text"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                    placeholder="Marketing Manager"
                                />
                            </div>
                        </div>

                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)] space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">
                                        <DollarSign className="w-3 h-3 inline mr-1" />
                                        Salary
                                    </label>
                                    <input
                                        type="text"
                                        value={salary}
                                        onChange={(e) => setSalary(e.target.value)}
                                        className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                        placeholder="$120,000/year"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">
                                        <Calendar className="w-3 h-3 inline mr-1" />
                                        Start Date
                                    </label>
                                    <input
                                        type="text"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                        placeholder="January 15, 2026"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Benefits Package</label>
                                <input
                                    type="text"
                                    value={benefits}
                                    onChange={(e) => setBenefits(e.target.value)}
                                    className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                    placeholder="Health, dental, 401k, PTO..."
                                />
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
                                    <FileText className="w-4 h-4" />
                                    Generate Offer Letter
                                </>
                            )}
                        </button>
                    </div>

                    <div className="relative">
                        <div className="h-full min-h-[700px] max-h-[900px] bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8 relative overflow-auto">
                            {generatedContent ? (
                                <>
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute top-4 right-4 p-2 bg-[var(--background)] hover:bg-[var(--background-secondary)] rounded-lg text-gray-400 hover:text-white transition-colors z-10"
                                        title="Copy to clipboard"
                                    >
                                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm font-serif">
                                        {generatedContent}
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 opacity-50 p-6 text-center">
                                    <FileText className="w-16 h-16 mb-4" />
                                    <p className="text-lg">Offer letter will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
