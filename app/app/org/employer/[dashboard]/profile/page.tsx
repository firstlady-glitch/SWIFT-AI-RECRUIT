'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Building2, MapPin, Globe, Users, Briefcase, ExternalLink, Edit } from 'lucide-react';
import Link from 'next/link';
import type { Organization } from '@/types';

export default function EmployerProfilePage() {
    const router = useRouter();
    const [org, setOrg] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOrgDetails();
    }, []);

    const fetchOrgDetails = async () => {
        setIsLoading(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!profile?.organization_id) {
                setError('No organization found');
                return;
            }

            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', profile.organization_id)
                .single();

            if (orgError) throw orgError;
            setOrg(orgData);

        } catch (err: any) {
            console.error('[EmployerProfile] Error:', err);
            setError('Failed to load organization details');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-8"><LoadingState type="card" count={1} /></div>;
    if (error || !org) return <div className="p-8"><ErrorState message={error || 'Organization not found'} /></div>;

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Public Profile Preview</h1>
                    <Link
                        href={`/app/org/employer/dashboard/settings`}
                        className="btn border border-[var(--border)] hover:bg-[var(--border)] flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" /> Edit Profile
                    </Link>
                </div>

                {/* Profile Card */}
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8 mb-6">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-32 h-32 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center overflow-hidden flex-shrink-0">
                            {org.logo_url ? (
                                <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-12 h-12 text-[var(--foreground-secondary)]" />
                            )}
                        </div>

                        <div className="flex-1 w-full">
                            <div className="mb-4">
                                <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">{org.name}</h1>
                                <div className="flex flex-wrap gap-4 text-sm text-[var(--foreground-secondary)]">
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

                            <p className="text-[var(--foreground-secondary)] leading-relaxed whitespace-pre-wrap">
                                {org.description || 'No description available.'}
                            </p>

                            {org.specializations && org.specializations.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-sm font-semibold text-[var(--foreground-secondary)] mb-2">Specializations</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {org.specializations.map((spec, i) => (
                                            <span key={i} className="px-3 py-1 bg-[var(--background)] rounded-full text-sm text-[var(--foreground-secondary)] border border-[var(--border)]">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}