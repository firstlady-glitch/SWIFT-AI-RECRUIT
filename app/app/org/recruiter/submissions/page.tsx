'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link2, Copy, Check, Users, Briefcase, Eye, Award, TrendingUp, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ReferralStats {
    clicks: number;
    signups: number;
    applications: number;
    hires: number;
}

export default function RecruiterSubmissionsPage() {
    const params = useParams();
    const [referralCode, setReferralCode] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [stats, setStats] = useState<ReferralStats>({ clicks: 0, signups: 0, applications: 0, hires: 0 });
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Generate referral code from user ID
            setReferralCode(user.id.slice(0, 8).toUpperCase());

            // Fetch submissions
            const { data: subs } = await supabase
                .from('recruiter_submissions')
                .select(`
                    *,
                    candidate:profiles!recruiter_submissions_candidate_id_fkey(full_name, job_title),
                    job:jobs(title, organization:organizations(name))
                `)
                .eq('recruiter_id', user.id)
                .order('created_at', { ascending: false });

            if (subs) {
                setSubmissions(subs.map(s => ({
                    ...s,
                    candidate: Array.isArray(s.candidate) ? s.candidate[0] : s.candidate,
                    job: Array.isArray(s.job) ? s.job[0] : s.job,
                })));

                // Calculate stats from submissions
                setStats({
                    clicks: 0, // Would need analytics tracking
                    signups: 0,
                    applications: subs.length,
                    hires: subs.filter(s => s.status === 'accepted').length,
                });
            }
        } catch (err) {
            console.error('[Submissions] Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const copyReferralLink = () => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const link = `${baseUrl}/auth/register?ref=${referralCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-green-500/10 text-green-400';
            case 'rejected': return 'bg-red-500/10 text-red-400';
            default: return 'bg-yellow-500/10 text-yellow-400';
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="h-8 w-48 bg-gray-800 rounded animate-pulse mb-6" />
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-2">Submissions & Referrals</h1>
            <p className="text-gray-400 mb-8">Track your candidate submissions and referral performance.</p>

            {/* Referral Link Card */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-semibold mb-1">Your Referral Link</h3>
                        <p className="text-white/70 text-sm">Share this link to earn commissions on successful placements.</p>
                    </div>
                    <button
                        onClick={copyReferralLink}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                </div>
                <div className="mt-4 bg-white/10 rounded-lg px-4 py-2 flex items-center gap-3">
                    <Link2 className="w-4 h-4 text-white/70" />
                    <code className="text-white/90 text-sm flex-1 truncate">
                        {typeof window !== 'undefined' ? `${window.location.origin}/auth/register?ref=${referralCode}` : '...'}
                    </code>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#15171e] border border-gray-800 rounded-xl p-4 text-center">
                    <Eye className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{stats.clicks}</p>
                    <p className="text-sm text-gray-500">Link Clicks</p>
                </div>
                <div className="bg-[#15171e] border border-gray-800 rounded-xl p-4 text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{stats.signups}</p>
                    <p className="text-sm text-gray-500">Sign Ups</p>
                </div>
                <div className="bg-[#15171e] border border-gray-800 rounded-xl p-4 text-center">
                    <Briefcase className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-2xl font-bold">{stats.applications}</p>
                    <p className="text-sm text-gray-500">Submissions</p>
                </div>
                <div className="bg-[#15171e] border border-gray-800 rounded-xl p-4 text-center">
                    <Award className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold">{stats.hires}</p>
                    <p className="text-sm text-gray-500">Placements</p>
                </div>
            </div>

            {/* Submissions Table */}
            <div className="bg-[#15171e] border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-800">
                    <h3 className="font-semibold">Recent Submissions</h3>
                </div>
                {submissions.length > 0 ? (
                    <div className="divide-y divide-gray-800">
                        {submissions.map((sub) => (
                            <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-gray-800/50">
                                <div>
                                    <p className="font-medium">{sub.candidate?.full_name || 'Unknown'}</p>
                                    <p className="text-sm text-gray-400">
                                        {sub.job?.title} at {sub.job?.organization?.name || 'Unknown'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(sub.status)}`}>
                                        {sub.status}
                                    </span>
                                    {sub.commission_amount && (
                                        <span className="text-green-400 font-medium">
                                            ${sub.commission_amount.toLocaleString()}
                                        </span>
                                    )}
                                    <span className="text-sm text-gray-500">
                                        {new Date(sub.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No submissions yet</p>
                        <a href={`/app/org/recruiter/${params.dashboard}/marketplace`} className="mt-2 text-[var(--primary-blue)] hover:underline inline-flex items-center gap-1">
                            Browse Jobs <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
