'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Search, Users, Briefcase, Filter, MapPin, User as UserIcon, ArrowRight } from 'lucide-react';
import { Profile } from '@/types';
import { LoadingState } from '@/components/ui/LoadingState';

// Employer Sourcing Page - Source recruiters and job seekers for gigs/contracts

export default function EmployerSourcingPage() {
    const router = useRouter();
    const params = useParams();
    const dashboardId = params.dashboard as string;

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'recruiters' | 'candidates'>('recruiters');
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [skillsFilter, setSkillsFilter] = useState('');

    useEffect(() => {
        fetchProfiles();
    }, [activeTab]);

    const fetchProfiles = async () => {
        setIsLoading(true);
        const supabase = createClient();

        try {
            // Determine the role to query based on active tab
            // tab 'recruiters' -> role 'recruiter'
            // tab 'candidates' -> role 'applicant'
            const roleToFetch = activeTab === 'recruiters' ? 'recruiter' : 'applicant';

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', roleToFetch)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProfiles(data || []);
        } catch (err) {
            console.error('Error fetching profiles:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProfiles = profiles.filter(profile => {
        const query = searchQuery.toLowerCase();
        const nameMatch = profile.full_name?.toLowerCase().includes(query) || false;
        const titleMatch = profile.job_title?.toLowerCase().includes(query) || false;
        const locationMatch = profile.location?.toLowerCase().includes(query) || false;

        // Simple skills matching if searching by skill name in the main search bar
        const skillsMatch = profile.skills?.some(skill => skill.toLowerCase().includes(query)) || false;

        return nameMatch || titleMatch || locationMatch || skillsMatch;
    });

    const handleViewProfile = (profileId: string) => {
        // Navigate to profile page in the same tab
        router.push(`/app/org/employer/${dashboardId}/profile/${profileId}`);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[var(--foreground)]">Talent Sourcing</h1>
                <p className="text-[var(--foreground-secondary)]">
                    Source recruiters and job seekers for gigs or contracts
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-[var(--border)]">
                <button
                    onClick={() => setActiveTab('recruiters')}
                    className={`px-4 py-3 font-medium transition-colors ${activeTab === 'recruiters'
                        ? 'text-[var(--primary-blue)] border-b-2 border-[var(--primary-blue)]'
                        : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Recruiters
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('candidates')}
                    className={`px-4 py-3 font-medium transition-colors ${activeTab === 'candidates'
                        ? 'text-[var(--primary-blue)] border-b-2 border-[var(--primary-blue)]'
                        : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Candidates
                    </div>
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-secondary)]" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'recruiters' ? 'recruiters' : 'candidates'} by name, title, or skills...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                    />
                </div>
                {/* Future: Advanced filters popover could go here */}
                {/* <button className="flex items-center gap-2 px-4 py-3 border border-[var(--border)] rounded-lg hover:bg-[var(--background-secondary)] transition-colors">
                    <Filter className="w-4 h-4" />
                    Filters
                </button> */}
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <LoadingState type="card" count={6} />
                </div>
            )}

            {/* Results Grid */}
            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProfiles.length > 0 ? (
                        filteredProfiles.map((profile) => (
                            <div
                                key={profile.id}
                                className="group bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--primary-blue)] transition-all cursor-pointer flex flex-col h-full"
                                onClick={() => handleViewProfile(profile.id)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center overflow-hidden">
                                            {profile.profile_image_url ? (
                                                <img src={profile.profile_image_url} alt={profile.full_name || ''} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-6 h-6 text-[var(--foreground-secondary)]" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[var(--foreground)] group-hover:text-[var(--primary-blue)] transition-colors">
                                                {profile.full_name || 'Unnamed User'}
                                            </h3>
                                            <p className="text-sm text-[var(--foreground-secondary)]">
                                                {profile.job_title || 'No Title'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6 flex-1">
                                    {profile.location && (
                                        <div className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)]">
                                            <MapPin className="w-4 h-4" />
                                            {profile.location}
                                        </div>
                                    )}

                                    {profile.experience_years && (
                                        <div className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)]">
                                            <Briefcase className="w-4 h-4" />
                                            {profile.experience_years} years experience
                                        </div>
                                    )}

                                    {profile.skills && profile.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {profile.skills.slice(0, 3).map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 text-xs rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--foreground-secondary)]"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {profile.skills.length > 3 && (
                                                <span className="px-2 py-1 text-xs text-[var(--foreground-secondary)]">
                                                    +{profile.skills.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    className="w-full py-2 px-4 bg-[var(--background)] hover:bg-[var(--primary-blue)] hover:text-white border border-[var(--border)] hover:border-transparent rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    View Profile
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center">
                            <div className="w-16 h-16 bg-[var(--background-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-[var(--foreground-secondary)]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No profiles found</h3>
                            <p className="text-[var(--foreground-secondary)]">
                                Try adjusting your search or filters to find what you're looking for.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}