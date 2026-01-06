'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePagination } from '@/hooks/use-pagination';
import { DataTable, StatusBadge, Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Building2 } from 'lucide-react';

interface Submission extends Record<string, unknown> {
    id: string;
    status: string;
    created_at: string;
    score: number;
    applicant: { full_name: string; email: string };
    job: { title: string; organization: { name: string } };
}

export default function RecruiterSubmissionsPage() {
    const pagination = usePagination<Submission>({ pageSize: 15 });

    useEffect(() => {
        fetchSubmissions();
    }, [pagination.page]);

    const fetchSubmissions = async () => {
        pagination.setLoading(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const from = (pagination.page - 1) * pagination.pageSize;
            const to = from + pagination.pageSize - 1;

            const { data, count, error } = await supabase
                .from('applications')
                .select(`
                    id, 
                    status, 
                    created_at, 
                    score,
                    applicant:profiles!applicant_id(full_name, email),
                    job:jobs(title, organization:organizations(name))
                `, { count: 'exact' })
                .eq('recruiter_id', user.id)
                .range(from, to)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const transformed = (data || []).map(item => ({
                ...item,
                applicant: Array.isArray(item.applicant) ? item.applicant[0] : item.applicant,
                job: {
                    ...(Array.isArray(item.job) ? item.job[0] : item.job),
                    organization: Array.isArray((item.job as any)?.organization)
                        ? (item.job as any).organization[0]
                        : (item.job as any)?.organization
                }
            }));

            pagination.setData(transformed as any, count || 0);
            console.log('[Submissions] Loaded', transformed.length, 'submissions');

        } catch (err: any) {
            console.error('[Submissions] Error:', err);
            pagination.setError('Failed to load submissions.');
        } finally {
            pagination.setLoading(false);
        }
    };

    const columns: Column<Submission>[] = [
        {
            key: 'applicant.full_name',
            header: 'Candidate',
            render: (row) => (
                <div>
                    <div className="font-medium text-white">{row.applicant?.full_name}</div>
                    <div className="text-xs text-gray-400">{row.applicant?.email}</div>
                </div>
            )
        },
        {
            key: 'job.title',
            header: 'Submitted To',
            render: (row) => (
                <div>
                    <div className="text-gray-300">{row.job?.title}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Building2 className="w-3 h-3" />
                        {row.job?.organization?.name}
                    </div>
                </div>
            )
        },
        {
            key: 'score',
            header: 'Match',
            render: (row) => (
                <span className={`font-bold ${row.score >= 80 ? 'text-green-400' : 'text-gray-400'}`}>
                    {row.score}%
                </span>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => <StatusBadge status={row.status} variant="application" />
        },
        {
            key: 'created_at',
            header: 'Submitted',
            render: (row) => <span className="text-gray-500 text-sm">{new Date(row.created_at).toLocaleDateString()}</span>
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">My Submissions</h1>
                    <p className="text-gray-400">Track candidates you have submitted to roles.</p>
                </div>

                {pagination.isLoading ? (
                    <LoadingState type="table" count={5} />
                ) : pagination.error ? (
                    <ErrorState message={pagination.error} onRetry={fetchSubmissions} />
                ) : (
                    <>
                        <DataTable
                            columns={columns}
                            data={pagination.data}
                            keyField="id"
                            emptyMessage="No submissions found."
                        />
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
