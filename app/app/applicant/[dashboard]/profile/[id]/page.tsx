'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Building2, MapPin, Globe, Users, Briefcase, Calendar, MessageSquare, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Organization, Job } from '@/types';

export default function OrganizationProfilePage() {
    const params = useParams();
    const router = useRouter();
    const orgId = params.id as string;
    const dashboardId = params.dashboard as string;

    const [org, setOrg] = useState<Organization | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);

    useEffect(() => {
        fetchOrgDetails();
    }, [orgId]);

    const fetchOrgDetails = async () => {
        setIsLoading(true);
        const supabase = createClient();

        try {
            // First try to fetch as an Organization
            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', orgId)
                .maybeSingle();

            if (orgData) {
                setOrg(orgData);

                // Fetch Active Jobs for this org
                const { data: jobsData } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('organization_id', orgId)
                    .eq('status', 'published')
                    .order('created_at', { ascending: false });

                setJobs(jobsData || []);
            } else {
                // If not found as org, maybe it's a user profile ID - redirect to profile view
                // Check if it's a valid profile
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .eq('id', orgId)
                    .maybeSingle();

                if (profileData) {
                    // Redirect to proper profile viewing - for now show error since this page is for orgs
                    setError('This page is for viewing organizations. User profiles are displayed differently.');
                } else {
                    setError('Organization or profile not found');
                }
            }

        } catch (err: any) {
            console.error('[OrgProfile] Error:', err);
            setError('Failed to load organization details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMessage = async () => {
        if (!org) return;
        setIsCreatingConversation(true);

        try {
            // Find the org owner/creator to message
            // Ideally we'd message the "Organization" entity but our system matches users.
            // For now, let's message the creator of the org.
            // We need to find the profile associated with this org who created it or is admin.
            // Simplified: Message created_by

            const recipientId = org.created_by; // Assuming created_by is a profile ID (UUID)

            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId: recipientId })
            });

            if (!res.ok) throw new Error('Failed to start conversation');

            // Redirect to messages
            router.push(`/app/applicant/${dashboardId}/messages`);

        } catch (err) {
            console.error('Error starting conversation:', err);
            alert('Failed to start conversation. Please try again.');
        } finally {
            setIsCreatingConversation(false);
        }
    };

    if (isLoading) return <div className="p-8"><LoadingState type="card" count={1} /></div>;
    if (error || !org) return <div className="p-8"><ErrorState message={error || 'Organization not found'} /></div>;

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>

                {/* Header */}
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8 mb-6">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-32 h-32 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden border border-[var(--border)] flex-shrink-0">
                            {org.logo_url ? (
                                <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-12 h-12 text-gray-500" />
                            )}
                        </div>

                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">{org.name}</h1>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                        {org.industry && (
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="w-4 h-4" /> {org.industry}
                                            </span>
                                        )}
                                        {org.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" /> {org.location}
                                            </span>
                                        )}
                                        {org.size && (
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" /> {org.size} employees
                                            </span>
                                        )}
                                        {org.website && (
                                            <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[var(--primary-blue)]">
                                                <Globe className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleMessage}
                                    disabled={isCreatingConversation}
                                    className="btn btn-primary px-6 py-2 flex items-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    {isCreatingConversation ? 'Starting...' : 'Message'}
                                </button>
                            </div>

                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {org.description || 'No description available.'}
                            </p>

                            {org.specializations && org.specializations.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Specializations</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {org.specializations.map((spec, i) => (
                                            <span key={i} className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Active Jobs */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">Open Positions ({jobs.length})</h2>
                    {jobs.length === 0 ? (
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8 text-center text-gray-500">
                            No open positions at the moment.
                        </div>
                    ) : (
                        jobs.map(job => (
                            <Link
                                key={job.id}
                                href={`/app/applicant/${dashboardId}/jobs/${job.id}`}
                                className="block bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--primary-blue)] transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-[var(--primary-blue)]">
                                            {job.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                            {job.location && <span>{job.location}</span>}
                                            {job.type && <span className="capitalize">{job.type.replace('_', ' ')}</span>}
                                            {job.salary_range_min && (
                                                <span>
                                                    ${(job.salary_range_min / 1000).toFixed(0)}k
                                                    {job.salary_range_max ? ` - ${(job.salary_range_max / 1000).toFixed(0)}k` : '+'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        Posted {new Date(job.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}