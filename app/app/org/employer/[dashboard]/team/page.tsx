'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Users, Plus, Shield, User, Mail, Trash2, Check, X, Loader2, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { TeamMember, TeamRole } from '@/types';

type TeamMemberWithProfile = Omit<TeamMember, 'profile'> & {
    profile?: {
        full_name: string | null;
        email: string | null;
        profile_image_url: string | null;
    };
};

export default function TeamPage() {
    const params = useParams();
    const dashboard = params.dashboard as string;
    const [members, setMembers] = useState<TeamMemberWithProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<TeamRole>('member');
    const [isInviting, setIsInviting] = useState(false);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
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
                // Gracefully handle missing organization by showing empty state
                setMembers([]);
                return;
            }

            const { data, error: fetchError } = await supabase
                .from('team_members')
                .select('*, profile:profiles(full_name, email, profile_image_url)')
                .eq('organization_id', profile.organization_id);

            if (fetchError) throw fetchError;

            const transformed = (data || []).map(m => ({
                ...m,
                profile: Array.isArray(m.profile) ? m.profile[0] : m.profile
            }));

            setMembers(transformed);
        } catch (err: any) {
            console.error('Error loading team:', err);
            // Don't show error to user, just show empty state for better UX
            setMembers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        setIsInviting(true);

        try {
            const res = await fetch('/api/team/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: inviteEmail.trim(),
                    role: inviteRole,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to send invite');
            }

            setShowInvite(false);
            setInviteEmail('');
            fetchTeam();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemove = async (memberId: string) => {
        if (!confirm('Remove this team member?')) return;

        const supabase = createClient();

        try {
            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('id', memberId);

            if (error) throw error;
            setMembers(prev => prev.filter(m => m.id !== memberId));
        } catch (err) {
            setError('Failed to remove member');
        }
    };

    const getRoleBadge = (role: TeamRole) => {
        switch (role) {
            case 'owner': return 'bg-yellow-500/10 text-yellow-400';
            case 'admin': return 'bg-purple-500/10 text-purple-400';
            case 'member': return 'bg-blue-500/10 text-blue-400';
            case 'viewer': return 'bg-gray-500/10 text-gray-400';
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Team</h1>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i}
                            className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-4 animate-pulse h-20" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) return <ErrorState message={error} onRetry={fetchTeam} />;

    return (
        <div className="max-w-4xl p-8 mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Team Management</h1>
                    <p className="text-gray-400">{members.length} members</p>
                </div>
                {members.length > 0 && (
                    <button
                        onClick={() => setShowInvite(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-blue)] hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Invite Member
                    </button>
                )}
            </div>

            {/* Invite Modal */}
            {showInvite && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 w-full max-w-md">
                        <div className="flex justify-between mb-4">
                            <h3 className="text-lg font-semibold">Invite Team Member</h3>
                            <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="colleague@company.com"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-[var(--primary-blue)] focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Role</label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="member">Member</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowInvite(false)}
                                    className="flex-1 py-3 border border-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isInviting}
                                    className="flex-1 py-3 bg-[var(--primary-blue)] text-white rounded-lg flex items-center justify-center gap-2"
                                >
                                    {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                    Send Invite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Members List */}
            <div className="space-y-3">
                {members.map((member) => (
                    <div key={member.id} className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                                    {member.profile?.profile_image_url ? (
                                        <img src={member.profile.profile_image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6 text-gray-500" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-white">{member.profile?.full_name || 'Invited User'}</p>
                                        {!member.accepted_at && (
                                            <span className="px-2 py-0.5 text-xs bg-yellow-500/10 text-yellow-400 rounded">Pending</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400">{member.profile?.email || member.invite_email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded text-xs capitalize ${getRoleBadge(member.role)}`}>
                                    {member.role}
                                </span>
                                {member.role !== 'owner' && (
                                    <button
                                        onClick={() => handleRemove(member.id)}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {members.length === 0 && (
                    <EmptyState
                        icon={Briefcase}
                        title="Start Hiring Your Team"
                        description="You don't have any team members yet. Invite colleagues to help you hire, or start creating jobs yourself."
                        actionLabel="Create a Job"
                        actionHref={`/app/org/employer/${dashboard}/jobs/create`}
                    />
                )}
            </div>
        </div>
    );
}
