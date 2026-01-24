'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { User, MapPin, Briefcase, Mail, Phone, Linkedin, Globe, ArrowLeft, MessageSquare, Building2, Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Profile, Organization, Job } from '@/types';

type ViewType = 'profile' | 'organization';

export default function RecruiterViewProfilePage() {
    const params = useParams();
    const router = useRouter();
    const targetId = params.id as string;
    const dashboardId = params.dashboard as string;

    const [viewType, setViewType] = useState<ViewType | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [org, setOrg] = useState<Organization | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [targetId]);

    const fetchDetails = async () => {
        setIsLoading(true);
        const supabase = createClient();

        try {
            // First try to fetch as a Profile (candidate)
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', targetId)
                .maybeSingle();

            if (profileData) {
                setProfile(profileData);
                setViewType('profile');
            } else {
                // Try as Organization
                const { data: orgData } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('id', targetId)
                    .maybeSingle();

                if (orgData) {
                    setOrg(orgData);
                    setViewType('organization');

                    // Fetch jobs for org
                    const { data: jobsData } = await supabase
                        .from('jobs')
                        .select('*')
                        .eq('organization_id', targetId)
                        .eq('status', 'published')
                        .order('created_at', { ascending: false });

                    setJobs(jobsData || []);
                } else {
                    setError('Profile or Organization not found');
                }
            }

        } catch (err: any) {
            console.error('[RecruiterViewProfile] Error:', err);
            setError('Failed to load details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMessage = async (recipientId: string) => {
        setIsCreatingConversation(true);
        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId })
            });

            if (!res.ok) throw new Error('Failed to start conversation');
            router.push(`/app/org/recruiter/${dashboardId}/messages`);
        } catch (err) {
            console.error('Error starting conversation:', err);
            alert('Failed to start conversation');
        } finally {
            setIsCreatingConversation(false);
        }
    };

    if (isLoading) return <div className="p-8"><LoadingState type="card" count={1} /></div>;
    if (error) return <div className="p-8"><ErrorState message={error} /></div>;

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>

                {viewType === 'profile' && profile && (
                    <>
                        {/* Profile Header */}
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8 mb-6">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="w-32 h-32 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {profile.profile_image_url ? (
                                        <img src={profile.profile_image_url} alt={profile.full_name || 'Profile'} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-[var(--foreground-secondary)]" />
                                    )}
                                </div>

                                <div className="flex-1 w-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">{profile.full_name || 'Unnamed User'}</h1>
                                            {profile.job_title && (
                                                <p className="text-xl text-[var(--foreground-secondary)]">{profile.job_title}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleMessage(profile.id)}
                                            disabled={isCreatingConversation}
                                            className="btn btn-primary px-6 py-2 flex items-center gap-2"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            {isCreatingConversation ? 'Starting...' : 'Message'}
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-[var(--foreground-secondary)]">
                                        {profile.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" /> {profile.location}
                                            </span>
                                        )}
                                        {profile.experience_years && profile.experience_years > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="w-4 h-4" /> {profile.experience_years} years experience
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 mb-6">
                            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {profile.email && (
                                    <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)]">
                                        <Mail className="w-4 h-4" /> {profile.email}
                                    </a>
                                )}
                                {profile.phone && (
                                    <a href={`tel:${profile.phone}`} className="flex items-center gap-3 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)]">
                                        <Phone className="w-4 h-4" /> {profile.phone}
                                    </a>
                                )}
                                {profile.linkedin_url && (
                                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)]">
                                        <Linkedin className="w-4 h-4" /> LinkedIn Profile
                                    </a>
                                )}
                                {profile.website && (
                                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)]">
                                        <Globe className="w-4 h-4" /> {profile.website}
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Skills */}
                        {profile.skills && profile.skills.length > 0 && (
                            <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 mb-6">
                                <h2 className="text-lg font-semibold mb-4">Skills</h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)]">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resume */}
                        {profile.resume_url && (
                            <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                                <h2 className="text-lg font-semibold mb-4">Resume</h2>
                                <a
                                    href={profile.resume_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary inline-flex items-center gap-2"
                                >
                                    View Resume
                                </a>
                            </div>
                        )}
                    </>
                )}

                {viewType === 'organization' && org && (
                    <>
                        {/* Org Header */}
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
                                            onClick={() => handleMessage(org.created_by)}
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

                        {/* Open Jobs */}
                        {jobs.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white mb-4">Open Positions ({jobs.length})</h2>
                                {jobs.map(job => (
                                    <div
                                        key={job.id}
                                        className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6"
                                    >
                                        <h3 className="text-lg font-semibold text-white mb-1">{job.title}</h3>
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
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}