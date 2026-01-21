'use client';

import { useEffect, useState } from 'react';
import {
    BarChart3,
    Users,
    Briefcase,
    FileText,
    TrendingUp,
    Calendar,
    ArrowUp,
    ArrowDown,
    Building2
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { createClient } from '@/lib/supabase/client';

interface AnalyticsData {
    usersByRole: { role: string; count: number }[];
    jobsByStatus: { status: string; count: number }[];
    applicationsByStatus: { status: string; count: number }[];
    userGrowth: { date: string; count: number }[];
    topOrganizations: { name: string; jobCount: number }[];
}

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        const supabase = createClient();
        setIsLoading(true);

        try {
            // Users by role
            const { data: profiles } = await supabase.from('profiles').select('role');
            const roleCounts = (profiles || []).reduce((acc: Record<string, number>, p) => {
                acc[p.role] = (acc[p.role] || 0) + 1;
                return acc;
            }, {});
            const usersByRole = Object.entries(roleCounts).map(([role, count]) => ({ role, count }));

            // Jobs by status
            const { data: jobs } = await supabase.from('jobs').select('status');
            const statusCounts = (jobs || []).reduce((acc: Record<string, number>, j) => {
                acc[j.status] = (acc[j.status] || 0) + 1;
                return acc;
            }, {});
            const jobsByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

            // Applications by status
            const { data: apps } = await supabase.from('applications').select('status');
            const appCounts = (apps || []).reduce((acc: Record<string, number>, a) => {
                acc[a.status] = (acc[a.status] || 0) + 1;
                return acc;
            }, {});
            const applicationsByStatus = Object.entries(appCounts).map(([status, count]) => ({ status, count }));

            // Top organizations by job count
            const { data: orgs } = await supabase
                .from('organizations')
                .select('name, jobs:jobs(count)')
                .limit(5);

            const topOrganizations = (orgs || []).map(o => ({
                name: o.name,
                jobCount: Array.isArray(o.jobs) ? o.jobs.length : 0
            })).sort((a, b) => b.jobCount - a.jobCount);

            setData({
                usersByRole,
                jobsByStatus,
                applicationsByStatus,
                userGrowth: [],
                topOrganizations,
            });
        } catch (err) {
            console.error('[Analytics] Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getBarWidth = (count: number, max: number) => {
        return max > 0 ? `${(count / max) * 100}%` : '0%';
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Analytics</h1>
                <div className="grid md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 h-64 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const maxUserCount = Math.max(...(data?.usersByRole.map(u => u.count) || [1]));
    const maxJobCount = Math.max(...(data?.jobsByStatus.map(j => j.count) || [1]));
    const maxAppCount = Math.max(...(data?.applicationsByStatus.map(a => a.count) || [1]));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Analytics</h1>
                    <p className="text-gray-400">Platform insights and metrics</p>
                </div>
                <div className="flex items-center gap-2 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-1">
                    {(['7d', '30d', '90d'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 rounded text-sm ${timeRange === range ? 'bg-[var(--primary-blue)] text-white' : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'}`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Users by Role */}
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" /> Users by Role
                    </h3>
                    <div className="space-y-3">
                        {data?.usersByRole.map((item) => (
                            <div key={item.role}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="capitalize text-[var(--foreground-secondary)]">{item.role}</span>
                                    <span className="text-[var(--foreground)]">{item.count}</span>
                                </div>
                                <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all"
                                        style={{ width: getBarWidth(item.count, maxUserCount) }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Jobs by Status */}
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-orange-500" /> Jobs by Status
                    </h3>
                    <div className="space-y-3">
                        {data?.jobsByStatus.map((item) => (
                            <div key={item.status}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="capitalize text-[var(--foreground-secondary)]">{item.status}</span>
                                    <span className="text-[var(--foreground)]">{item.count}</span>
                                </div>
                                <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-500 rounded-full transition-all"
                                        style={{ width: getBarWidth(item.count, maxJobCount) }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Applications by Status */}
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-500" /> Applications by Status
                    </h3>
                    <div className="space-y-3">
                        {data?.applicationsByStatus.map((item) => (
                            <div key={item.status}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="capitalize text-[var(--foreground-secondary)]">{item.status}</span>
                                    <span className="text-[var(--foreground)]">{item.count}</span>
                                </div>
                                <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full transition-all"
                                        style={{ width: getBarWidth(item.count, maxAppCount) }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Organizations */}
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-500" /> Top Organizations
                    </h3>
                    <div className="space-y-3">
                        {data?.topOrganizations.map((org, i) => (
                            <div key={org.name} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center text-xs font-bold">
                                        {i + 1}
                                    </span>
                                    <span className="text-[var(--foreground)]">{org.name}</span>
                                </div>
                                <span className="text-[var(--foreground-secondary)]">{org.jobCount} jobs</span>
                            </div>
                        ))}
                        {(!data?.topOrganizations || data.topOrganizations.length === 0) && (
                            <EmptyState
                                icon={Building2}
                                title="No Data Available"
                                description="Organization data will appear once they start posting jobs."
                                className="py-4"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
