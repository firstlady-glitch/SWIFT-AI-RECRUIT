'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePagination } from '@/hooks/use-pagination';
import { DataTable, StatusBadge, Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Building2, MapPin, ArrowRight, Activity } from 'lucide-react';
import Link from 'next/link';

interface Application extends Record<string, unknown> {
    id: string;
    status: string;
    created_at: string;
    updated_at: string;
    score: number | null;
    job_id: string;
    job: {
        title: string;
        location: string | null;
        organization: { name: string; logo_url: string | null } | null;
    } | null;
}

export default function ApplicantApplicationsPage() {
    const pagination = usePagination<Application>({ pageSize: 15 });
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchApplications();
    }, [pagination.page, statusFilter]);

    const fetchApplications = async () => {
        pagination.setLoading(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                pagination.setError('Please log in.');
                return;
            }

            let query = supabase
                .from('applications')
                .select(`
                    id,
                    status,
                    created_at,
                    updated_at,
                    score,
                    job_id,
                    job:jobs (
                        title, 
                        location,
                        organization:organizations (name, logo_url)
                    )
                `, { count: 'exact' })
                .eq('applicant_id', user.id)
                .order('updated_at', { ascending: false });

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const from = (pagination.page - 1) * pagination.pageSize;
            const to = from + pagination.pageSize - 1;
            query = query.range(from, to);

            const { data, count, error } = await query;
            if (error) throw error;

            const transformed = (data || []).map(app => ({
                ...app,
                job: Array.isArray(app.job) ? app.job[0] : app.job,
            })).map(app => ({
                ...app,
                job: {
                    ...app.job,
                    organization: (app.job && Array.isArray(app.job.organization))
                        ? app.job.organization[0]
                        : app.job?.organization
                }
            }));

            pagination.setData(transformed as any, count || 0);
            console.log('[Applications] Loaded', transformed.length, 'applications');

        } catch (err: any) {
            console.error('[Applications] Error:', err);
            pagination.setError('Failed to load applications.');
        } finally {
            pagination.setLoading(false);
        }
    };

    const columns: Column<Application>[] = [
        {
            key: 'job.title',
            header: 'Role',
            render: (row) => (
                <div className="flex items-center gap-3">
                    {row.job?.organization?.logo_url ? (
                        <img
                            src={row.job.organization.logo_url}
                            alt={row.job.organization.name}
                            className="w-10 h-10 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-gray-500" />
                        </div>
                    )}
                    <div>
                        <div className="font-medium text-white">{row.job?.title || 'Unknown Role'}</div>
                        <div className="text-xs text-gray-400">{row.job?.organization?.name || 'Unknown Company'}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <StatusBadge status={row.status} variant="application" />
        },
        {
            key: 'updated_at',
            header: 'Last Activity',
            render: (row) => (
                <div className="flex items-center gap-2 text-gray-400">
                    <Activity className="w-3 h-3" />
                    {new Date(row.updated_at).toLocaleDateString()}
                </div>
            )
        },
        {
            key: 'job.location',
            header: 'Location',
            render: (row) => (
                <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {row.job?.location || 'Remote'}
                </div>
            )
        },
        {
            key: 'actions',
            header: '',
            width: '100px',
            render: (row) => (
                <Link
                    href={`/app/applicant/jobs/${row.job_id}`}
                    className="p-2 hover:bg-gray-800 rounded-lg inline-flex text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowRight className="w-4 h-4" />
                </Link>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">My Applications</h1>
                    <p className="text-gray-400">Track and manage your job applications.</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-gray-800">
                    {['all', 'applied', 'reviewed', 'interview', 'offer', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${statusFilter === status
                                ? 'bg-[var(--primary-blue)] text-white'
                                : 'bg-[#15171e] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {pagination.isLoading ? (
                    <LoadingState type="table" count={5} />
                ) : pagination.error ? (
                    <ErrorState message={pagination.error} onRetry={fetchApplications} />
                ) : (
                    <>
                        <DataTable
                            columns={columns}
                            data={pagination.data}
                            keyField="id"
                            emptyMessage="You haven't applied to any jobs yet."
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
