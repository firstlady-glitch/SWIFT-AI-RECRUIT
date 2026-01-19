'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Search, Building2, MapPin, DollarSign, Eye, Trash2, Globe, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Job, JobStatus } from '@/types';

type JobWithOrg = Omit<Job, 'organization'> & {
    organization?: { name: string };
};

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<JobWithOrg[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        const supabase = createClient();
        setIsLoading(true);

        try {
            const { data, error: fetchError } = await supabase
                .from('jobs')
                .select('*, organization:organizations(name)')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            const transformed = (data || []).map(job => ({
                ...job,
                organization: Array.isArray(job.organization) ? job.organization[0] : job.organization
            }));

            setJobs(transformed);
        } catch (err) {
            setError('Failed to load jobs.');
        } finally {
            setIsLoading(false);
        }
    };

    const updateJobStatus = async (jobId: string, status: JobStatus) => {
        const supabase = createClient();

        try {
            const { error } = await supabase.from('jobs').update({ status }).eq('id', jobId);
            if (error) throw error;
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
        } catch (err) {
            setError('Failed to update job.');
        }
    };

    const deleteJob = async (jobId: string) => {
        if (!confirm('Delete this job?')) return;
        const supabase = createClient();

        try {
            const { error } = await supabase.from('jobs').delete().eq('id', jobId);
            if (error) throw error;
            setJobs(prev => prev.filter(j => j.id !== jobId));
        } catch (err) {
            setError('Failed to delete job.');
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = !searchQuery ||
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: JobStatus) => {
        switch (status) {
            case 'published': return 'bg-green-500/10 text-green-400';
            case 'draft': return 'bg-yellow-500/10 text-yellow-400';
            case 'closed': return 'bg-gray-500/10 text-gray-400';
            case 'archived': return 'bg-red-500/10 text-red-400';
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Jobs</h1>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-[#15171e] border border-gray-800 rounded-xl p-4 animate-pulse h-20" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) return <ErrorState message={error} onRetry={fetchJobs} />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">All Jobs</h1>
                <p className="text-gray-400">{jobs.length} total jobs</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#15171e] border border-gray-800 rounded-lg focus:outline-none"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
                    className="px-4 py-3 bg-[#15171e] border border-gray-800 rounded-lg"
                >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="closed">Closed</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

            {/* Jobs List */}
            <div className="space-y-3">
                {filteredJobs.map((job) => (
                    <div key={job.id} className="bg-[#15171e] border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-medium text-white">{job.title}</h3>
                                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(job.status)}`}>
                                        {job.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> {job.organization?.name || 'Unknown'}
                                    </span>
                                    {job.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {job.location}
                                        </span>
                                    )}
                                    {job.salary_range_min && job.salary_range_max && (
                                        <span className="flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" />
                                            ${job.salary_range_min.toLocaleString()} - ${job.salary_range_max.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {job.status === 'published' ? (
                                    <button
                                        onClick={() => updateJobStatus(job.id, 'closed')}
                                        className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg"
                                        title="Close Job"
                                    >
                                        <EyeOff className="w-5 h-5" />
                                    </button>
                                ) : job.status === 'draft' ? (
                                    <button
                                        onClick={() => updateJobStatus(job.id, 'published')}
                                        className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg"
                                        title="Publish Job"
                                    >
                                        <Globe className="w-5 h-5" />
                                    </button>
                                ) : null}
                                <button
                                    onClick={() => deleteJob(job.id)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                    title="Delete Job"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredJobs.length === 0 && (
                    <div className="bg-[#15171e] border border-gray-800 rounded-xl">
                        <EmptyState
                            icon={Briefcase}
                            title="No Jobs Found"
                            description={searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filter criteria.' : 'No jobs have been posted yet.'}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
