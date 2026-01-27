'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ErrorState } from '@/components/ui/ErrorState';
import { Plus, X, ExternalLink, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RecruiterCreateJobPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        type: 'Full-time',
        salary_range_min: '',
        salary_range_max: '',
        requirements: [''],
        application_type: 'internal' as 'internal' | 'external',
        external_apply_url: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!profile?.organization_id) {
                throw new Error('You must belong to an organization');
            }

            const { data, error } = await supabase
                .from('jobs')
                .insert({
                    organization_id: profile.organization_id,
                    posted_by: user.id,
                    title: formData.title,
                    description: formData.description,
                    location: formData.location || null,
                    type: formData.type,
                    salary_range_min: formData.salary_range_min ? parseInt(formData.salary_range_min) : null,
                    salary_range_max: formData.salary_range_max ? parseInt(formData.salary_range_max) : null,
                    requirements: formData.requirements.filter(r => r.trim()),
                    application_type: formData.application_type,
                    external_apply_url: formData.application_type === 'external' ? formData.external_apply_url : null,
                    status: 'draft'
                })
                .select()
                .single();

            if (error) throw error;

            console.log('[RecruiterCreateJob] Created job:', data.id);
            router.push(`/app/org/recruiter/jobs/${data.id}`);

        } catch (err: any) {
            console.error('[RecruiterCreateJob] Error:', err);
            setError(err.message || 'Failed to create job');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addRequirement = () => {
        setFormData(prev => ({ ...prev, requirements: [...prev.requirements, ''] }));
    };

    const removeRequirement = (index: number) => {
        setFormData(prev => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== index)
        }));
    };

    const updateRequirement = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            requirements: prev.requirements.map((r, i) => i === index ? value : r)
        }));
    };

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Post a New Job</h1>
                    <p className="text-gray-400">Create a job listing for your clients or talent pool.</p>
                </div>

                {error && (
                    <div className="mb-6">
                        <ErrorState message={error} />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Basic Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Job Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g. Senior Frontend Developer"
                                    className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-4 py-2 focus:border-[var(--accent-orange)] focus:outline-none"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                        placeholder="e.g. San Francisco, CA or Remote"
                                        className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-4 py-2 focus:border-[var(--accent-orange)] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Job Type *</label>
                                    <select
                                        required
                                        value={formData.type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                        className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-4 py-2 focus:border-[var(--accent-orange)] focus:outline-none"
                                    >
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                        <option>Internship</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Salary Min ($)</label>
                                    <input
                                        type="number"
                                        value={formData.salary_range_min}
                                        onChange={(e) => setFormData(prev => ({ ...prev, salary_range_min: e.target.value }))}
                                        placeholder="80000"
                                        className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-4 py-2 focus:border-[var(--accent-orange)] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Salary Max ($)</label>
                                    <input
                                        type="number"
                                        value={formData.salary_range_max}
                                        onChange={(e) => setFormData(prev => ({ ...prev, salary_range_max: e.target.value }))}
                                        placeholder="120000"
                                        className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-4 py-2 focus:border-[var(--accent-orange)] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Job Description *</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                                    rows={8}
                                    className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-4 py-2 focus:border-[var(--accent-orange)] focus:outline-none"
                                />
                                <div className="mt-2">
                                    <Link
                                        href="/app/org/recruiter/dashboard/tools/job-description"
                                        className="text-sm text-[var(--accent-orange)] hover:underline flex items-center gap-1"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                        Use AI Job Description Generator
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Application Type */}
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Application Method</h2>
                        <p className="text-gray-400 text-sm mb-4">
                            Choose how candidates will apply for this position.
                        </p>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, application_type: 'internal' }))}
                                className={`p-4 border rounded-xl text-left transition-all ${formData.application_type === 'internal'
                                    ? 'border-[var(--accent-orange)] bg-orange-500/10'
                                    : 'border-[var(--border)] hover:border-[var(--border)]'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <FileText className="w-5 h-5 text-[var(--accent-orange)]" />
                                    <span className="font-semibold">In-App Application</span>
                                </div>
                                <p className="text-sm text-gray-400">
                                    Candidates apply on SwiftAI. Manage candidates and submit to clients.
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, application_type: 'external' }))}
                                className={`p-4 border rounded-xl text-left transition-all ${formData.application_type === 'external'
                                    ? 'border-[var(--primary-blue)] bg-blue-500/10'
                                    : 'border-[var(--border)] hover:border-[var(--border)]'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <ExternalLink className="w-5 h-5 text-[var(--primary-blue)]" />
                                    <span className="font-semibold">Client's Career Page</span>
                                </div>
                                <p className="text-sm text-gray-400">
                                    Redirect to external URL. You'll receive click analytics only.
                                </p>
                            </button>
                        </div>

                        {formData.application_type === 'external' && (
                            <div>
                                <label className="block text-sm font-medium mb-2">External Application URL *</label>
                                <input
                                    type="url"
                                    required={formData.application_type === 'external'}
                                    value={formData.external_apply_url}
                                    onChange={(e) => setFormData(prev => ({ ...prev, external_apply_url: e.target.value }))}
                                    placeholder="https://clientcompany.com/careers/job-123"
                                    className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-4 py-2 focus:border-[var(--primary-blue)] focus:outline-none"
                                />
                            </div>
                        )}
                    </div>

                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Requirements</h2>

                        <div className="space-y-3">
                            {formData.requirements.map((req, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={req}
                                        onChange={(e) => updateRequirement(index, e.target.value)}
                                        placeholder="e.g. 5+ years of React experience"
                                        className="flex-1 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-4 py-2 focus:border-[var(--accent-orange)] focus:outline-none"
                                    />
                                    {formData.requirements.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRequirement(index)}
                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addRequirement}
                                className="flex items-center gap-2 text-sm text-[var(--accent-orange)] hover:underline"
                            >
                                <Plus className="w-4 h-4" />
                                Add Requirement
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link
                            href="/app/org/recruiter/marketplace"
                            className="btn border border-[var(--border)] hover:bg-[var(--background-secondary)] px-6 py-3"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn bg-[var(--accent-orange)] hover:bg-orange-600 text-white px-8 py-3"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Job (as Draft)'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
