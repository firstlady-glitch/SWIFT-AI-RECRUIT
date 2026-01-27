'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ArrowLeft, Edit, Users, MapPin, Briefcase, Clock, FileText } from 'lucide-react';
import Link from 'next/link';

export default function RecruiterJobDetailsPage() {
    const params = useParams();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJob = async () => {
            const supabase = createClient();
            try {
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*, applications(count)')
                    .eq('id', params.id)
                    .single();

                if (error) throw error;
                setJob(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [params.id]);

    if (loading) return <div className="p-8"><LoadingState type="card" count={1} /></div>;
    if (error) return <div className="p-8"><ErrorState message={error} /></div>;
    if (!job) return <div className="p-8"><ErrorState message="Job not found" /></div>;

    const applicantCount = job.applications?.[0]?.count ?? 0;

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                <Link
                    href={`/app/org/recruiter/${params.dashboard}/jobs`}
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Jobs
                </Link>

                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8 mb-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                            <div className="flex gap-4 text-gray-400 text-sm">
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location || 'Remote'}</span>
                                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.type}</span>
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(job.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <Link
                            href={`/app/org/recruiter/${params.dashboard}/jobs/${job.id}/edit`}
                            className="btn border border-[var(--border)] hover:bg-[var(--background-secondary)] px-4 py-2 flex items-center gap-2"
                        >
                            <Edit className="w-4 h-4" />
                            Edit Job
                        </Link>
                    </div>

                    <div className="prose prose-invert max-w-none text-gray-300">
                        <h3 className="text-white font-semibold mb-2">Description</h3>
                        <p className="whitespace-pre-wrap">{job.description}</p>
                    </div>
                </div>

                <Link
                    href={`/app/org/recruiter/${params.dashboard}/jobs/${job.id}/applicants`}
                    className="w-full bg-[var(--background-secondary)] border border-[var(--border)] hover:border-[var(--primary-blue)] p-6 rounded-xl flex items-center justify-between group transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-[var(--primary-blue)] transition-colors">
                                View Applicants & AI Ranking
                            </h3>
                            <p className="text-gray-400">
                                {applicantCount} candidates applied • Sort by Match Score
                            </p>
                        </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 rotate-180 text-gray-500 group-hover:text-blue-400 transition-colors" />
                </Link>
            </div>
        </div>
    );
}