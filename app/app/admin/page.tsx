'use client';

import { useEffect, useState } from 'react';
import {
    Users,
    Building2,
    Briefcase,
    FileText,
    TrendingUp,
    DollarSign,
    Activity,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

interface Stats {
    totalUsers: number;
    totalOrganizations: number;
    totalJobs: number;
    totalApplications: number;
    newUsersToday: number;
    activeJobsCount: number;
    hiredThisMonth: number;
    revenue: number;
}

interface RecentActivity {
    id: string;
    type: string;
    description: string;
    timestamp: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const supabase = createClient();

            try {
                // Fetch counts
                const [
                    { count: usersCount },
                    { count: orgsCount },
                    { count: jobsCount },
                    { count: appsCount },
                    { count: activeJobsCount },
                    { data: billings }
                ] = await Promise.all([
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('organizations').select('*', { count: 'exact', head: true }),
                    supabase.from('jobs').select('*', { count: 'exact', head: true }),
                    supabase.from('applications').select('*', { count: 'exact', head: true }),
                    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'published'),
                    supabase.from('billings').select('amount').eq('status', 'succeeded'),
                ]);

                // Calculate today's new users
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const { count: newUsersToday } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', today.toISOString());

                // Calculate hired this month
                const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const { count: hiredThisMonth } = await supabase
                    .from('applications')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'hired')
                    .gte('updated_at', firstOfMonth.toISOString());

                // Calculate total revenue
                const revenue = billings?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

                setStats({
                    totalUsers: usersCount || 0,
                    totalOrganizations: orgsCount || 0,
                    totalJobs: jobsCount || 0,
                    totalApplications: appsCount || 0,
                    newUsersToday: newUsersToday || 0,
                    activeJobsCount: activeJobsCount || 0,
                    hiredThisMonth: hiredThisMonth || 0,
                    revenue: revenue / 100, // Convert cents to dollars
                });

                // Fetch recent activity (pipeline events)
                const { data: events } = await supabase
                    .from('pipeline_events')
                    .select('id, event_type, event_category, created_at')
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (events) {
                    setRecentActivity(events.map(e => ({
                        id: e.id,
                        type: e.event_category,
                        description: e.event_type.replace(/_/g, ' '),
                        timestamp: e.created_at,
                    })));
                }

                console.log('[AdminDashboard] Loaded dashboard data');
            } catch (err: any) {
                console.error('[AdminDashboard] Error:', err);
                setError('Failed to load dashboard data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 animate-pulse">
                            <div className="h-4 bg-[var(--border)] rounded w-1/2 mb-4" />
                            <div className="h-8 bg-[var(--border)] rounded w-1/3" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <ErrorState message={error} onRetry={() => window.location.reload()} />;
    }

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Organizations', value: stats?.totalOrganizations || 0, icon: Building2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Total Jobs', value: stats?.totalJobs || 0, icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: 'Applications', value: stats?.totalApplications || 0, icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'New Users Today', value: stats?.newUsersToday || 0, icon: TrendingUp, color: 'text-cyan-500', bg: 'bg-cyan-500/10', trend: 'up' },
        { label: 'Active Jobs', value: stats?.activeJobsCount || 0, icon: Activity, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { label: 'Hired This Month', value: stats?.hiredThisMonth || 0, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: 'up' },
        { label: 'Total Revenue', value: `$${(stats?.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-[var(--foreground-secondary)]">Platform overview and key metrics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.label} className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            {stat.trend && (
                                <div className={`flex items-center gap-1 text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                    {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                </div>
                            )}
                        </div>
                        <p className="text-[var(--foreground-secondary)] text-sm mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                {recentActivity.length > 0 ? (
                    <div className="space-y-3">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[var(--primary-blue)]" />
                                    <div>
                                        <p className="text-[var(--foreground)] text-sm capitalize">{activity.description}</p>
                                        <p className="text-xs text-[var(--foreground-secondary)]">{activity.type}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-[var(--foreground-secondary)]">
                                    {new Date(activity.timestamp).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={Activity}
                        title="No Recent Activity"
                        description="Platform events and activities will appear here."
                    />
                )}
            </div>
        </div>
    );
}
