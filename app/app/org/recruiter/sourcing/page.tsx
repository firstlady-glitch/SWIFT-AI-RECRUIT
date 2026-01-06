'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePagination } from '@/hooks/use-pagination';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Search, User } from 'lucide-react';
import { useEffect } from 'react';

interface Candidate extends Record<string, unknown> {
    id: string;
    full_name: string;
    email: string;
    job_title: string | null;
    skills: string[] | null;
    location: string | null;
    experience_years: number | null;
}

export default function RecruiterSourcingPage() {
    const pagination = usePagination<Candidate>({ pageSize: 15 });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCandidates();
    }, [pagination.page]);

    const fetchCandidates = async () => {
        pagination.setLoading(true);
        const supabase = createClient();

        try {
            const from = (pagination.page - 1) * pagination.pageSize;
            const to = from + pagination.pageSize - 1;

            const { data, count, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, job_title, skills, location, experience_years', { count: 'exact' })
                .eq('role', 'applicant')
                .range(from, to)
                .order('created_at', { ascending: false });

            if (error) throw error;

            pagination.setData(data || [], count || 0);
            console.log('[Sourcing] Loaded', data?.length, 'candidates');

        } catch (err: any) {
            console.error('[Sourcing] Error:', err);
            pagination.setError('Failed to load candidates.');
        } finally {
            pagination.setLoading(false);
        }
    };

    const columns: Column<Candidate>[] = [
        {
            key: 'full_name',
            header: 'Name',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                        <div className="font-medium text-white">{row.full_name}</div>
                        <div className="text-xs text-gray-500">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'job_title',
            header: 'Title',
            render: (row) => <span className="text-gray-300">{row.job_title || '-'}</span>
        },
        {
            key: 'skills',
            header: 'Skills',
            render: (row) => (
                <div className="flex flex-wrap gap-1">
                    {row.skills?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-800 rounded text-xs">
                            {skill}
                        </span>
                    ))}
                    {row.skills && row.skills.length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                            +{row.skills.length - 3}
                        </span>
                    )}
                </div>
            )
        },
        {
            key: 'location',
            header: 'Location',
            render: (row) => <span className="text-gray-400">{row.location || 'Not specified'}</span>
        },
        {
            key: 'actions',
            header: '',
            render: (row) => (
                <button
                    className="btn btn-sm border border-gray-700 hover:bg-gray-800"
                    onClick={() => alert(`Contact ${row.full_name} at ${row.email}`)}
                >
                    Contact
                </button>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Candidate Sourcing</h1>
                    <p className="text-gray-400">Search and connect with talented candidates.</p>
                </div>

                <div className="bg-[#15171e] border border-gray-800 rounded-xl p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, title, skills..."
                            className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg pl-10 pr-4 py-2 focus:border-[var(--primary-blue)] focus:outline-none"
                        />
                    </div>
                </div>

                {pagination.isLoading ? (
                    <LoadingState type="table" count={5} />
                ) : pagination.error ? (
                    <ErrorState message={pagination.error} onRetry={fetchCandidates} />
                ) : (
                    <>
                        <DataTable
                            columns={columns}
                            data={pagination.data}
                            keyField="id"
                            emptyMessage="No candidates found."
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
