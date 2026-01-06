'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePagination } from '@/hooks/use-pagination';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Building2, MapPin, DollarSign } from 'lucide-react';

interface MarketplaceJob extends Record<string, unknown> {
    id: string;
    title: string;
    location: string | null;
    salary_range_min: number | null;
    salary_range_max: number | null;
    created_at: string;
    organization: { name: string; logo_url: string | null };
}

export default function RecruiterMarketplacePage() {
    const pagination = usePagination<MarketplaceJob>({ pageSize: 12 });

    useEffect(() => {
        fetchMarketplace();
    }, [pagination.page]);

    const fetchMarketplace = async () => {
        pagination.setLoading(true);
        const supabase = createClient();

        try {
            const from = (pagination.page - 1) * pagination.pageSize;
            const to = from + pagination.pageSize - 1;

            const { data, count, error } = await supabase
                .from('jobs')
                .select(`
                    id,
                    title,
                    location,
                    salary_range_min,
                    salary_range_max,
                    created_at,
                    organization:organizations(name, logo_url)
                `, { count: 'exact' })
                .eq('status', 'published')
                .range(from, to)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const transformed = (data || []).map(job => ({
                ...job,
                organization: Array.isArray(job.organization) ? job.organization[0] : job.organization
            }));

            pagination.setData(transformed, count || 0);
            console.log('[Marketplace] Loaded', transformed.length, 'jobs');

        } catch (err: any) {
            console.error('[Marketplace] Error:', err);
            pagination.setError('Failed to load marketplace jobs.');
        } finally {
            pagination.setLoading(false);
        }
    };

    const columns: Column<MarketplaceJob>[] = [
        {
            key: 'title',
            header: 'Role',
            render: (row) => (
                <div className="flex items-center gap-3">
                    {row.organization?.logo_url ? (
                        <img src={row.organization.logo_url} className="w-10 h-10 rounded-lg" alt="" />
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-gray-500" />
                        </div>
                    )}
                    <div>
                        <div className="font-medium text-white">{row.title}</div>
                        <div className="text-xs text-gray-400">{row.organization?.name}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'location',
            header: 'Location',
            render: (row) => (
                <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {row.location || 'Remote'}
                </div>
            )
        },
        {
            key: 'salary_range_max',
            header: 'Budget',
            render: (row) => (
                <div className="flex items-center gap-1 text-gray-300">
                    <DollarSign className="w-3 h-3" />
                    {row.salary_range_min ? `${(row.salary_range_min / 1000).toFixed(0)}k` : ''}
                    {row.salary_range_max ? ` - ${(row.salary_range_max / 1000).toFixed(0)}k` : ''}
                </div>
            )
        },
        {
            key: 'actions',
            header: '',
            render: (row) => (
                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => alert(`Start sourcing for ${row.title} (ID: ${row.id})`)}
                >
                    Start Sourcing
                </button>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Recruiter Marketplace</h1>
                    <p className="text-gray-400">Discover jobs from top companies and earn commissions.</p>
                </div>

                {pagination.isLoading ? (
                    <LoadingState type="table" count={5} />
                ) : pagination.error ? (
                    <ErrorState message={pagination.error} onRetry={fetchMarketplace} />
                ) : (
                    <>
                        <DataTable
                            columns={columns}
                            data={pagination.data}
                            keyField="id"
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
