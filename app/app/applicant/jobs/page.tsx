'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePagination } from '@/hooks/use-pagination';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Building2, MapPin, DollarSign, Briefcase, Search } from 'lucide-react';
import Link from 'next/link';
import { Pagination } from '@/components/ui/Pagination';

interface Job extends Record<string, unknown> {
    id: string;
    title: string;
    location: string | null;
    type: string | null;
    salary_range_min: number | null;
    salary_range_max: number | null;
    created_at: string;
    organization: { name: string; logo_url: string | null };
}

export default function ApplicantJobsPage() {
    const pagination = usePagination<Job>({ pageSize: 12 });
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [minSalary, setMinSalary] = useState('');

    useEffect(() => {
        fetchJobs();
    }, [pagination.page, typeFilter]);

    const fetchJobs = async () => {
        pagination.setLoading(true);
        const supabase = createClient();

        try {
            const from = (pagination.page - 1) * pagination.pageSize;
            const to = from + pagination.pageSize - 1;

            let query = supabase
                .from('jobs')
                .select(`
                    id,
                    title,
                    location,
                    type,
                    salary_range_min,
                    salary_range_max,
                    created_at,
                    organization:organizations(name, logo_url)
                `, { count: 'exact' })
                .eq('status', 'published')
                .order('created_at', { ascending: false });

            if (typeFilter !== 'all') {
                query = query.eq('type', typeFilter);
            }

            const { data, count, error } = await query.range(from, to);

            if (error) throw error;

            const transformed = (data || []).map(job => ({
                ...job,
                organization: Array.isArray(job.organization) ? job.organization[0] : job.organization
            }));

            pagination.setData(transformed, count || 0);
            console.log('[ApplicantJobs] Loaded', transformed.length, 'jobs');

        } catch (err: any) {
            console.error('[ApplicantJobs] Error:', err);
            pagination.setError('Failed to load jobs. Please try again.');
        } finally {
            pagination.setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchJobs();
    };

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Find Your Next Role</h1>
                    <p className="text-gray-400">Browse open positions and apply with one click.</p>
                </div>

                {/* Search & Filters */}
                <div className="bg-[#15171e] border border-gray-800 rounded-xl p-6 mb-8">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Job title, keywords..."
                                    className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg pl-10 pr-4 py-2 focus:border-[var(--primary-blue)] focus:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Location</label>
                            <input
                                type="text"
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                placeholder="City, state, or remote"
                                className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg px-4 py-2 focus:border-[var(--primary-blue)] focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Job Type</label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg px-4 py-2 focus:border-[var(--primary-blue)] focus:outline-none"
                            >
                                <option value="all">All Types</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Job Cards */}
                {pagination.isLoading ? (
                    <LoadingState type="card" count={6} />
                ) : pagination.error ? (
                    <ErrorState message={pagination.error} onRetry={fetchJobs} />
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {pagination.data.map((job) => (
                                <Link
                                    key={job.id}
                                    href={`/app/applicant/jobs/${job.id}`}
                                    className="bg-[#15171e] border border-gray-800 rounded-xl p-6 hover:border-[var(--primary-blue)] transition-all group"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        {job.organization?.logo_url ? (
                                            <img
                                                src={job.organization.logo_url}
                                                alt={job.organization.name}
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-gray-500" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white group-hover:text-[var(--primary-blue)] transition-colors mb-1">
                                                {job.title}
                                            </h3>
                                            <p className="text-sm text-gray-400">{job.organization?.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                            {job.location || 'Remote'}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Briefcase className="w-4 h-4" />
                                            {job.type || 'Full-time'}
                                        </div>
                                        {(job.salary_range_min || job.salary_range_max) && (
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <DollarSign className="w-4 h-4" />
                                                {job.salary_range_min && `${(job.salary_range_min / 1000).toFixed(0)}k`}
                                                {job.salary_range_max && ` - ${(job.salary_range_max / 1000).toFixed(0)}k`}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-gray-800">
                                        <span className="text-[var(--primary-blue)] text-sm font-medium group-hover:underline">
                                            View Details →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <Pagination
                            {...pagination}
                            hasNextPage={pagination.hasNextPage}
                            hasPrevPage={pagination.hasPrevPage}
                            onNextPage={pagination.nextPage}
                            onPrevPage={pagination.prevPage}
                            onGoToPage={pagination.goToPage}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
