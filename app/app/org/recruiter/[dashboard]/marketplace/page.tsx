'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Briefcase,
    SearchIcon,
    MapPin,
    DollarSign,
    Building2,
    Users,
    ArrowRight,
    Target,
    Star
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Job } from '@/types';

type MarketplaceJob = Omit<Job, 'organization'> & {
    organization?: { name: string; logo_url: string | null };
    _count?: { applications: number };
};

export default function RecruiterMarketplacePage() {
    const params = useParams();
    const [jobs, setJobs] = useState<MarketplaceJob[]>([]);
    const [sourcingJobs, setSourcingJobs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('');

    useEffect(() => {
        fetchMarketplaceJobs();
    }, []);

    const fetchMarketplaceJobs = async () => {
        setIsLoading(true);
        const supabase = createClient();

        try {
            // Fetch published jobs from employers
            const { data: jobsData, error: jobsError } = await supabase
                .from('jobs')
                .select(`
                    *,
                    organization:organizations(name, logo_url)
                `)
                .eq('status', 'published')
                .order('created_at', { ascending: false });

            if (jobsError) throw jobsError;

            const transformed = (jobsData || []).map(job => ({
                ...job,
                organization: Array.isArray(job.organization) ? job.organization[0] : job.organization
            }));

            setJobs(transformed);

            // Fetch jobs user is actively sourcing
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: sourcing } = await supabase
                    .from('recruiter_submissions')
                    .select('job_id')
                    .eq('recruiter_id', user.id);

                const uniqueJobIds = [...new Set((sourcing || []).map(s => s.job_id))];
                setSourcingJobs(uniqueJobIds);
            }

            console.log('[Marketplace] Loaded jobs:', transformed.length);
        } catch (err: any) {
            console.error('[Marketplace] Error:', err);
            setError('Failed to load marketplace jobs');
        } finally {
            setIsLoading(false);
        }
    };

    const startSourcing = async (jobId: string) => {
        // Just navigate to the sourcing page
        window.location.href = `/app/org/recruiter/${params.dashboard}/sourcing/${jobId}`;
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = !searchQuery ||
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLocation = !locationFilter ||
            job.location?.toLowerCase().includes(locationFilter.toLowerCase());
        return matchesSearch && matchesLocation;
    });

    if (isLoading) {
        return (
            <div className="p-8 max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Job Marketplace</h1>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 animate-pulse h-64" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) return <ErrorState message={error} onRetry={fetchMarketplaceJobs} />;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Job Marketplace</h1>
                <p className="text-gray-400">Find employer jobs to source candidates for and earn commissions</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-4 text-center">
                    <Briefcase className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{jobs.length}</p>
                    <p className="text-sm text-[var(--foreground-secondary)]">Available Jobs</p>
                </div>
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-4 text-center">
                    <Target className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-2xl font-bold">{sourcingJobs.length}</p>
                    <p className="text-sm text-[var(--foreground-secondary)]">Jobs Sourcing</p>
                </div>
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-4 text-center">
                    <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-[var(--foreground-secondary)]">Placements</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search jobs or companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:border-[var(--primary-blue)] focus:outline-none"
                    />
                </div>
                <div className="relative w-64">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Location..."
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:border-[var(--primary-blue)] focus:outline-none"
                    />
                </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredJobs.map((job) => {
                    const isSourcing = sourcingJobs.includes(job.id);
                    return (
                        <div key={job.id} className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--primary-blue)] transition-colors">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {job.organization?.logo_url ? (
                                        <img src={job.organization.logo_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 className="w-6 h-6 text-[var(--foreground-secondary)]" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-[var(--foreground)] truncate">{job.title}</h3>
                                    <p className="text-sm text-[var(--foreground-secondary)]">{job.organization?.name}</p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-[var(--foreground-secondary)] mb-4">
                                {job.location && (
                                    <p className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> {job.location}
                                    </p>
                                )}
                                {job.salary_range_min && job.salary_range_max && (
                                    <p className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        ${job.salary_range_min.toLocaleString()} - ${job.salary_range_max.toLocaleString()}
                                    </p>
                                )}
                                {job.type && (
                                    <span className="inline-block px-2 py-0.5 bg-[var(--background)] border border-[var(--border)] rounded text-xs">{job.type}</span>
                                )}
                            </div>

                            <button
                                onClick={() => startSourcing(job.id)}
                                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${isSourcing
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                    : 'bg-[var(--primary-blue)] hover:bg-blue-600 text-white'
                                    }`}
                            >
                                {isSourcing ? (
                                    <>
                                        <Target className="w-4 h-4" /> Sourcing
                                    </>
                                ) : (
                                    <>
                                        Start Sourcing <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {filteredJobs.length === 0 && (
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl">
                    <EmptyState
                        icon={Briefcase}
                        title="No Jobs Available"
                        description={searchQuery || locationFilter ? 'Try adjusting your search criteria.' : 'There are no open positions in the marketplace at the moment.'}
                    />
                </div>
            )}
        </div>
    );
}
