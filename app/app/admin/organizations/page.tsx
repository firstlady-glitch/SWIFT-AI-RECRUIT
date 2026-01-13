'use client';

import { useEffect, useState } from 'react';
import { Building2, Search, Filter, Users, MapPin, Globe, MoreVertical, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ErrorState } from '@/components/ui/ErrorState';
import type { Organization, OrgType } from '@/types';

export default function AdminOrganizationsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<OrgType | 'all'>('all');
    const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        const supabase = createClient();
        setIsLoading(true);

        try {
            const { data, error: fetchError } = await supabase
                .from('organizations')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setOrganizations(data || []);
        } catch (err: any) {
            console.error('[AdminOrgs] Error:', err);
            setError('Failed to load organizations.');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteOrganization = async (orgId: string) => {
        if (!confirm('Delete this organization? This will also delete all associated jobs.')) return;

        const supabase = createClient();

        try {
            const { error } = await supabase.from('organizations').delete().eq('id', orgId);
            if (error) throw error;
            setOrganizations(prev => prev.filter(o => o.id !== orgId));
        } catch (err) {
            setError('Failed to delete organization.');
        }
    };

    const filteredOrgs = organizations.filter(org => {
        const matchesSearch = !searchQuery ||
            org.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || org.type === typeFilter;
        return matchesSearch && matchesType;
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Organizations</h1>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-[#15171e] border border-gray-800 rounded-xl p-6 animate-pulse">
                            <div className="w-16 h-16 bg-gray-800 rounded-xl mb-4" />
                            <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-gray-800 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) return <ErrorState message={error} onRetry={fetchOrganizations} />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Organizations</h1>
                <p className="text-gray-400">{organizations.length} total organizations</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search organizations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#15171e] border border-gray-800 rounded-lg focus:border-[var(--primary-blue)] focus:outline-none"
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as OrgType | 'all')}
                    className="px-4 py-3 bg-[#15171e] border border-gray-800 rounded-lg"
                >
                    <option value="all">All Types</option>
                    <option value="employer">Employer</option>
                    <option value="recruiter">Recruiter</option>
                </select>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrgs.map((org) => (
                    <div key={org.id} className="bg-[#15171e] border border-gray-800 rounded-xl p-6 relative group">
                        <button
                            onClick={() => setSelectedOrg(selectedOrg === org.id ? null : org.id)}
                            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {selectedOrg === org.id && (
                            <div className="absolute top-12 right-4 bg-[#0b0c0f] border border-gray-800 rounded-lg p-2 z-10">
                                <button
                                    onClick={() => deleteOrganization(org.id)}
                                    className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        )}

                        <div className="w-16 h-16 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden mb-4">
                            {org.logo_url ? (
                                <img src={org.logo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-8 h-8 text-gray-500" />
                            )}
                        </div>

                        <h3 className="font-semibold text-white mb-1">{org.name}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-3 ${org.type === 'employer' ? 'bg-purple-500/10 text-purple-400' : 'bg-orange-500/10 text-orange-400'}`}>
                            {org.type}
                        </span>

                        <div className="space-y-2 text-sm text-gray-400">
                            {org.industry && <p>{org.industry}</p>}
                            {org.location && (
                                <p className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {org.location}
                                </p>
                            )}
                            {org.website && (
                                <p className="flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> {org.website}
                                </p>
                            )}
                        </div>

                        <p className="text-xs text-gray-500 mt-4">
                            Plan: <span className="text-gray-300 capitalize">{org.plan}</span>
                        </p>
                    </div>
                ))}
            </div>

            {filteredOrgs.length === 0 && (
                <div className="text-center py-12">
                    <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No organizations found</p>
                </div>
            )}
        </div>
    );
}
