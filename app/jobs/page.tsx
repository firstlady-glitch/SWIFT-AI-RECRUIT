'use client';

import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Clock } from 'lucide-react';

// Define Job Type based on Supabase Schema
type Job = {
    id: string;
    title: string;
    description: string;
    location: string;
    type: string;
    salary_range_min: number | null;
    salary_range_max: number | null;
    currency: string;
    created_at: string;
    organization: {
        name: string;
        logo_url: string | null;
    } | null;
};

export default function JobsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data, error } = await supabase
                    .from('jobs')
                    .select(`
                        id,
                        title,
                        description,
                        location,
                        type,
                        salary_range_min,
                        salary_range_max,
                        currency,
                        created_at,
                        organization:organizations(name, logo_url)
                    `)
                    .eq('status', 'published')
                    .eq('is_public', true)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching jobs:', error);
                } else {
                    setJobs(data as unknown as Job[]);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [supabase]);

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.organization?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            {/* Header Section (Same style as FAQ) */}
            <section className="pt-32 pb-20 px-6 bg-[var(--background-secondary)] text-center relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10">
                    <Image
                        src="/careers.png" // Reusing careers background
                        alt="Jobs Background"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Browse Open Positions</h1>
                    <p className="text-xl text-[var(--foreground-secondary)] max-w-2xl mx-auto mb-8">
                        Find your next dream job at top AI and Tech companies.
                    </p>
                    <div className="relative max-w-2xl mx-auto mb-8">
                        <input
                            type="text"
                            placeholder="Search by title, company, or keywords..."
                            className="w-full py-4 pl-6 pr-14 rounded-full border border-gray-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="absolute right-2 top-2 bottom-2 bg-[var(--primary-blue)] text-white p-3 rounded-full hover:bg-blue-600 transition-colors">
                            <Search className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Jobs List Section */}
            <section className="py-20 section max-w-7xl mx-auto px-6 min-h-[500px]">
                {loading ? (
                    // content placeholder
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card p-6 border border-[var(--border)] animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/4 mb-2"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredJobs.length > 0 ? (
                    <div className="grid gap-6">
                        {filteredJobs.map((job) => (
                            <div key={job.id} className="card p-6 border border-[var(--border)] hover:border-[var(--primary-blue)] transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--primary-blue)] transition-colors">
                                            {job.title}
                                        </h3>
                                        <span className="badge bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-semibold uppercase">
                                            {job.type}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--foreground-secondary)] mb-4">
                                        <div className="flex items-center gap-1">
                                            <Briefcase className="w-4 h-4" />
                                            {job.organization?.name || 'Company Confidential'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {job.location || 'Remote'}
                                        </div>
                                        {(job.salary_range_min || job.salary_range_max) && (
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-4 h-4" />
                                                {job.currency} {job.salary_range_min?.toLocaleString()} - {job.salary_range_max?.toLocaleString()}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <p className="text-[var(--foreground-secondary)] line-clamp-2">
                                        {job.description}
                                    </p>
                                </div>
                                <Link href={`/jobs/${job.id}`} className="btn btn-outline whitespace-nowrap self-start md:self-center">
                                    View Details
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Empty State
                    <div className="text-center py-20 flex flex-col items-center justify-center">
                        <div className="bg-gray-100 p-8 rounded-full mb-6">
                            <Search className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3 text-[var(--foreground)]">No Jobs Found</h2>
                        <p className="text-[var(--foreground-secondary)] max-w-md mx-auto mb-8">
                            We couldn't find any jobs matching "<strong>{searchTerm}</strong>". Try narrowing your search or checking back later as new positions are added daily.
                        </p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="btn btn-secondary"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </section>

            <Footer />
        </div>
    );
}
