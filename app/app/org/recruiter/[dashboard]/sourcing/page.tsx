'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { usePagination } from '@/hooks/use-pagination';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import {
    Search,
    User,
    X,
    Mail,
    MapPin,
    Briefcase,
    Clock,
    Link as LinkIcon,
    Linkedin,
    Globe,
    Phone,
    MessageSquare
} from 'lucide-react';

interface Candidate extends Record<string, unknown> {
    id: string;
    full_name: string;
    email: string;
    job_title: string | null;
    skills: string[] | null;
    location: string | null;
    experience_years: number | null;
    phone?: string | null;
    linkedin_url?: string | null;
    website?: string | null;
    bio?: string | null;
}

export default function RecruiterSourcingPage() {
    const router = useRouter();
    const params = useParams();
    const dashboard = params.dashboard as string;
    const pagination = usePagination<Candidate>({ pageSize: 15 });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

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

    const viewCandidateDetails = async (candidateId: string) => {
        setIsLoadingDetails(true);
        const supabase = createClient();

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', candidateId)
                .single();

            if (error) throw error;
            setSelectedCandidate(data);
        } catch (err) {
            console.error('[Sourcing] Error loading candidate details:', err);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const closeModal = () => {
        setSelectedCandidate(null);
    };

    const handleMessage = async (candidateId: string) => {
        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId: candidateId })
            });

            if (!res.ok) throw new Error('Failed to start conversation');

            const { conversation } = await res.json();

            // Note: Recruiter dashboard ID is needed for route. 
            // Assuming we can get it from URL or just use 'recruiter' if path is fixed.
            // Better to get params, but 'sourcing' is inside [dashboard].
            // Let's get dashboard ID from window logic or hook if params not available here easily (it is available via hook)

            // Wait, we are in a client component, let's use router push to a relative path or absolute if we can get params.
            // Actually, we are in [dashboard]/sourcing/page.tsx, so we can use useParams

            router.push(`/app/org/recruiter/${dashboard}/messages`);
        } catch (err) {
            console.error('Error starting conversation:', err);
            // Ideally show a toast here
            alert('Failed to start conversation');
        }
    };

    const columns: Column<Candidate>[] = [
        {
            key: 'full_name',
            header: 'Name',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                        <div className="font-medium text-[var(--foreground)]">{row.full_name}</div>
                        <div className="text-xs text-[var(--foreground-secondary)]">{row.email}</div>
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
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => viewCandidateDetails(row.id)}
                        className="btn btn-sm border border-gray-700 hover:bg-gray-800"
                    >
                        View
                    </button>
                    <button
                        onClick={() => handleMessage(row.id)}
                        className="btn btn-sm bg-[var(--background-secondary)] border border-[var(--border)] hover:bg-gray-800 text-gray-300"
                        title="Send Message"
                    >
                        <MessageSquare className="w-4 h-4" />
                    </button>
                    <a
                        href={`mailto:${row.email}?subject=Opportunity from SwiftAI Recruit&body=Hi ${row.full_name},%0D%0A%0D%0AI came across your profile and would like to discuss a potential opportunity with you.%0D%0A%0D%0ABest regards`}
                        className="btn btn-sm bg-[var(--primary-blue)] hover:bg-blue-600 text-white"
                    >
                        Contact
                    </a>
                </div>
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

                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, title, skills..."
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 focus:border-[var(--primary-blue)] focus:outline-none text-[var(--foreground)]"
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

            {/* Candidate Detail Modal */}
            {(selectedCandidate || isLoadingDetails) && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {isLoadingDetails ? (
                            <div className="p-12 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-blue)] border-t-transparent" />
                            </div>
                        ) : selectedCandidate && (
                            <>
                                {/* Modal Header */}
                                <div className="sticky top-0 bg-[var(--background-secondary)] border-b border-[var(--border)] p-6 flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                                            {selectedCandidate.full_name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">
                                                {selectedCandidate.full_name}
                                            </h2>
                                            <p className="text-gray-400">
                                                {selectedCandidate.job_title || 'No title specified'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 space-y-6">
                                    {/* Quick Info Cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 text-center">
                                            <Clock className="w-5 h-5 mx-auto mb-2 text-blue-400" />
                                            <p className="text-lg font-bold text-[var(--foreground)]">
                                                {selectedCandidate.experience_years || 0}
                                            </p>
                                            <p className="text-xs text-[var(--foreground-secondary)]">Years Exp.</p>
                                        </div>
                                        <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 text-center">
                                            <Briefcase className="w-5 h-5 mx-auto mb-2 text-green-400" />
                                            <p className="text-lg font-bold text-[var(--foreground)]">
                                                {selectedCandidate.skills?.length || 0}
                                            </p>
                                            <p className="text-xs text-[var(--foreground-secondary)]">Skills</p>
                                        </div>
                                        <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 text-center col-span-2">
                                            <MapPin className="w-5 h-5 mx-auto mb-2 text-orange-400" />
                                            <p className="text-sm font-medium text-[var(--foreground)] truncate">
                                                {selectedCandidate.location || 'Not specified'}
                                            </p>
                                            <p className="text-xs text-[var(--foreground-secondary)]">Location</p>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
                                        <h3 className="text-sm font-semibold text-[var(--foreground-secondary)] mb-3">Contact Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-4 h-4 text-[var(--foreground-secondary)]" />
                                                <a href={`mailto:${selectedCandidate.email}`} className="text-blue-400 hover:underline">
                                                    {selectedCandidate.email}
                                                </a>
                                            </div>
                                            {selectedCandidate.phone && (
                                                <div className="flex items-center gap-3">
                                                    <Phone className="w-4 h-4 text-[var(--foreground-secondary)]" />
                                                    <a href={`tel:${selectedCandidate.phone}`} className="text-[var(--foreground)] hover:text-blue-400">
                                                        {selectedCandidate.phone}
                                                    </a>
                                                </div>
                                            )}
                                            {selectedCandidate.linkedin_url && (
                                                <div className="flex items-center gap-3">
                                                    <Linkedin className="w-4 h-4 text-[var(--foreground-secondary)]" />
                                                    <a href={selectedCandidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                        LinkedIn Profile
                                                    </a>
                                                </div>
                                            )}
                                            {selectedCandidate.website && (
                                                <div className="flex items-center gap-3">
                                                    <Globe className="w-4 h-4 text-[var(--foreground-secondary)]" />
                                                    <a href={selectedCandidate.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                        {selectedCandidate.website}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                                        <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
                                            <h3 className="text-sm font-semibold text-[var(--foreground-secondary)] mb-3">Skills</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedCandidate.skills.map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1.5 bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] rounded-lg text-sm"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Bio */}
                                    {selectedCandidate.bio && (
                                        <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
                                            <h3 className="text-sm font-semibold text-[var(--foreground-secondary)] mb-3">About</h3>
                                            <p className="text-[var(--foreground)] text-sm leading-relaxed">
                                                {selectedCandidate.bio}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="sticky bottom-0 bg-[var(--background-secondary)] border-t border-[var(--border)] p-6 flex gap-3">
                                    <a
                                        href={`mailto:${selectedCandidate.email}?subject=Opportunity from SwiftAI Recruit&body=Hi ${selectedCandidate.full_name},%0D%0A%0D%0AI came across your profile and would like to discuss a potential opportunity with you.%0D%0A%0D%0ABest regards`}
                                        className="flex-1 btn bg-[var(--primary-blue)] hover:bg-blue-600 text-white py-3 text-center"
                                    >
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Send Email
                                    </a>
                                    {selectedCandidate.phone && (
                                        <a
                                            href={`tel:${selectedCandidate.phone}`}
                                            className="btn border border-gray-700 hover:bg-gray-800 py-3 px-6"
                                        >
                                            <Phone className="w-4 h-4" />
                                        </a>
                                    )}
                                    {selectedCandidate.linkedin_url && (
                                        <a
                                            href={selectedCandidate.linkedin_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn border border-gray-700 hover:bg-gray-800 py-3 px-6"
                                        >
                                            <Linkedin className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
