'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Plus, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface JobData {
    id: string;
    title: string;
    description: string;
    location: string | null;
    type: string;
    salary_range_min: number | null;
    salary_range_max: number | null;
    requirements: string[];
    status: string;
}

export default function EditJobPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        type: 'Full-time',
        salary_range_min: '',
        salary_range_max: '',
        requirements: ['']
    });

    useEffect(() => {
        fetchJob();
    }, [jobId]);

    const fetchJob = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/jobs/${jobId}`);
            if (!res.ok) throw new Error('Failed to load job');

            const job: JobData = await res.json();

            setFormData({
                title: job.title,
                description: job.description,
                location: job.location || '',
                type: job.type || 'Full-time',
                salary_range_min: job.salary_range_min?.toString() || '',
                salary_range_max: job.salary_range_max?.toString() || '',
                requirements: job.requirements?.length ? job.requirements : ['']
            });

            console.log('[EditJob] Loaded job:', job.title);
        } catch (err: any) {
            console.error('[EditJob] Error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`/api/jobs/${jobId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    location: formData.location || null,
                    type: formData.type,
                    salary_range_min: formData.salary_range_min ? parseInt(formData.salary_range_min) : null,
                    salary_range_max: formData.salary_range_max ? parseInt(formData.salary_range_max) : null,
                    requirements: formData.requirements.filter(r => r.trim())
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update job');
            }

            console.log('[EditJob] Updated job:', jobId);
            router.push(`/app/org/employer/jobs/${jobId}`);

        } catch (err: any) {
            console.error('[EditJob] Error:', err);
            setError(err.message);
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--background)] p-8">
                <div className="max-w-4xl mx-auto">
                    <LoadingState type="card" count={2} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                <Link
                    href={`/app/org/employer/jobs/${jobId}`}
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Job
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Edit Job Posting</h1>
                    <p className="text-gray-400">Update the job details below.</p>
                </div>

                {error && (
                    <div className="mb-6">
                        <ErrorState message={error} onRetry={() => setError(null)} />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-[#15171e] border border-gray-800 rounded-xl p-6">
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
                                    className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg px-4 py-2 focus:border-[var(--primary-blue)] focus:outline-none"
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
                                        className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg px-4 py-2 focus:border-[var(--primary-blue)] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Job Type *</label>
                                    <select
                                        required
                                        value={formData.type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                        className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg px-4 py-2 focus:border-[var(--primary-blue)] focus:outline-none"
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
                                        className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg px-4 py-2 focus:border-[var(--primary-blue)] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Salary Max ($)</label>
                                    <input
                                        type="number"
                                        value={formData.salary_range_max}
                                        onChange={(e) => setFormData(prev => ({ ...prev, salary_range_max: e.target.value }))}
                                        placeholder="120000"
                                        className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg px-4 py-2 focus:border-[var(--primary-blue)] focus:outline-none"
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
                                    className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg px-4 py-2 focus:border-[var(--primary-blue)] focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#15171e] border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Requirements</h2>

                        <div className="space-y-3">
                            {formData.requirements.map((req, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={req}
                                        onChange={(e) => updateRequirement(index, e.target.value)}
                                        placeholder="e.g. 5+ years of React experience"
                                        className="flex-1 bg-[#0b0c0f] border border-gray-800 rounded-lg px-4 py-2 focus:border-[var(--primary-blue)] focus:outline-none"
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
                                className="flex items-center gap-2 text-sm text-[var(--primary-blue)] hover:underline"
                            >
                                <Plus className="w-4 h-4" />
                                Add Requirement
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link
                            href={`/app/org/employer/jobs/${jobId}`}
                            className="btn border border-gray-700 hover:bg-gray-800 px-6 py-3"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary px-8 py-3"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
