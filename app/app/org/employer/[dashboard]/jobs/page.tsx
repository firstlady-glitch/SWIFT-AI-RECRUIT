'use client';

// over here add a badge of applicants count for each listed job 

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { usePagination } from '@/hooks/use-pagination';
import { DataTable, StatusBadge, Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Plus, Eye, Users, Briefcase } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';

interface Job extends Record<string, unknown> {
    id: string;
    title: string;
    status: string;
    location: string | null;
    type: string | null;
    created_at: string;
    applicant_count: number;
}

export default function EmployerJobsPage() {
    const params = useParams();
    const dashboard = params.dashboard as string;
    const pagination = usePagination<Job>({ pageSize: 15 });
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchJobs();
    }, [pagination.page, statusFilter]);

    const fetchJobs = async () => {
        pagination.setLoading(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!profile?.organization_id) {
                pagination.setError('You must belong to an organization to view jobs.');
                return;
            }

            let query = supabase
                .from('jobs')
                .select(`
                    id, 
                    title, 
                    status, 
                    location, 
                    type, 
                    created_at,
                    applications:applications(count)
                `, { count: 'exact' })
                .eq('organization_id', profile.organization_id)
                .order('created_at', { ascending: false });

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const from = (pagination.page - 1) * pagination.pageSize;
            const to = from + pagination.pageSize - 1;
            query = query.range(from, to);

            const { data, count, error } = await query;
            if (error) throw error;

            const finalData = (data || []).map(job => ({
                id: job.id,
                title: job.title,
                status: job.status,
                location: job.location,
                type: job.type,
                created_at: job.created_at,
                applicant_count: Array.isArray(job.applications)
                    ? (job.applications[0] as any)?.count ?? job.applications.length
                    : 0
            }));

            pagination.setData(finalData, count || 0);
            console.log('[EmployerJobs] Loaded', finalData.length, 'jobs');

        } catch (err: any) {
            console.error('[EmployerJobs] Error:', err);
            pagination.setError('Failed to load jobs.');
        } finally {
            pagination.setLoading(false);
        }
    };

    const columns: Column<Job>[] = [
        {
            key: 'title',
            header: 'Job Title',
            width: '40%',
            render: (row) => (
                <Link href={`/app/org/employer/${dashboard}/jobs/${row.id}`} className="block">
                    <div className="font-medium text-[var(--foreground)] hover:text-[var(--primary-blue)] transition-colors">
                        {row.title}
                    </div>
                    <div className="text-xs text-[var(--foreground-secondary)] mt-0.5 flex gap-2">
                        <span>{row.location || 'Remote'}</span>
                        <span>•</span>
                        <span>{row.type || 'Full-time'}</span>
                    </div>
                </Link>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <StatusBadge status={row.status} variant="job" />
        },
        {
            key: 'applicant_count',
            header: 'Candidates',
            render: (row) => (
                <div className="flex items-center gap-1.5 text-[var(--foreground-secondary)]">
                    <Users className="w-4 h-4 text-[var(--foreground-secondary)]" />
                    {row.applicant_count}
                </div>
            )
        },
        {
            key: 'created_at',
            header: 'Posted',
            render: (row) => (
                <span className="text-[var(--foreground-secondary)] text-sm">
                    {new Date(row.created_at).toLocaleDateString()}
                </span>
            )
        },
        {
            key: 'actions',
            header: '',
            width: '100px',
            render: (row) => (
                <Link
                    href={`/app/org/employer/${dashboard}/jobs/${row.id}`}
                    className="p-2 hover:bg-[var(--background-secondary)] rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] inline-flex"
                    title="View Pipeline"
                >
                    <Eye className="w-4 h-4" />
                </Link>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Jobs</h1>
                        <p className="text-[var(--foreground-secondary)]">Manage your job postings and applicants.</p>
                    </div>
                    <Link
                        href={`/app/org/employer/${dashboard}/jobs/create`}
                        className="btn btn-primary px-4 py-2 flex items-center gap-2 w-fit"
                    >
                        <Plus className="w-4 h-4" />
                        Create Job
                    </Link>
                </div>

                <div className="flex gap-2 mb-6 border-b border-[var(--border)] pb-4">
                    {['all', 'published', 'draft', 'closed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                                ? 'bg-[var(--background-secondary)] text-[var(--foreground)]'
                                : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)]'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {pagination.isLoading ? (
                    <LoadingState type="table" count={5} />
                ) : pagination.error ? (
                    <ErrorState message={pagination.error} onRetry={fetchJobs} />
                ) : (
                    <>
                        <DataTable
                            columns={columns}
                            data={pagination.data}
                            keyField="id"
                            emptyState={
                                <EmptyState
                                    icon={Briefcase}
                                    title="No Jobs Found"
                                    description="You haven't created any job postings yet. Start attracting top talent!"
                                    actionLabel="Create Your First Job"
                                    actionHref={`/app/org/employer/${dashboard}/jobs/create`}
                                />
                            }
                        />
                        <Pagination
                            page={pagination.page}
                            totalPages={pagination.totalPages}
                            totalCount={pagination.totalCount}
                            pageSize={pagination.pageSize}
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
