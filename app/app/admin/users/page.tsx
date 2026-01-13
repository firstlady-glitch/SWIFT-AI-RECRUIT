'use client';

import { useEffect, useState } from 'react';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Shield,
    Ban,
    Trash2,
    CheckCircle,
    XCircle,
    Building2,
    Briefcase,
    User
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ErrorState } from '@/components/ui/ErrorState';
import type { Profile, UserRole } from '@/types';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const supabase = createClient();
        setIsLoading(true);

        try {
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setUsers(data || []);
            console.log('[AdminUsers] Loaded users:', data?.length);
        } catch (err: any) {
            console.error('[AdminUsers] Error:', err);
            setError('Failed to load users.');
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserRole = async (userId: string, newRole: UserRole) => {
        const supabase = createClient();
        setActionLoading(userId);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            setSelectedUser(null);
            console.log('[AdminUsers] Updated role:', userId, newRole);
        } catch (err: any) {
            console.error('[AdminUsers] Error updating role:', err);
            setError('Failed to update user role.');
        } finally {
            setActionLoading(null);
        }
    };

    const deleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        const supabase = createClient();
        setActionLoading(userId);

        try {
            // Note: This only deletes the profile. Full deletion requires admin SDK
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            setUsers(prev => prev.filter(u => u.id !== userId));
            console.log('[AdminUsers] Deleted user:', userId);
        } catch (err: any) {
            console.error('[AdminUsers] Error deleting user:', err);
            setError('Failed to delete user.');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = !searchQuery ||
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleIcon = (role: UserRole) => {
        switch (role) {
            case 'admin': return Shield;
            case 'employer': return Building2;
            case 'recruiter': return Briefcase;
            default: return User;
        }
    };

    const getRoleColor = (role: UserRole) => {
        switch (role) {
            case 'admin': return 'text-red-500 bg-red-500/10';
            case 'employer': return 'text-purple-500 bg-purple-500/10';
            case 'recruiter': return 'text-orange-500 bg-orange-500/10';
            default: return 'text-blue-500 bg-blue-500/10';
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Users</h1>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-[#15171e] border border-gray-800 rounded-xl p-4 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-800 rounded-full" />
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-800 rounded w-1/4 mb-2" />
                                    <div className="h-3 bg-gray-800 rounded w-1/3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <ErrorState message={error} onRetry={fetchUsers} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Users</h1>
                    <p className="text-gray-400">{users.length} total users</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#15171e] border border-gray-800 rounded-lg focus:border-[var(--primary-blue)] focus:outline-none"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                        className="px-4 py-3 bg-[#15171e] border border-gray-800 rounded-lg focus:border-[var(--primary-blue)] focus:outline-none"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="employer">Employer</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="applicant">Applicant</option>
                    </select>
                </div>
            </div>

            {/* Users List */}
            <div className="space-y-3">
                {filteredUsers.map((user) => {
                    const RoleIcon = getRoleIcon(user.role);
                    return (
                        <div key={user.id} className="bg-[#15171e] border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                                        {user.profile_image_url ? (
                                            <img src={user.profile_image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-6 h-6 text-gray-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{user.full_name || 'Unnamed User'}</p>
                                        <p className="text-sm text-gray-400">{user.email}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                <RoleIcon className="w-3 h-3" />
                                                {user.role}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {user.plan}
                                            </span>
                                            {user.onboarding_completed && (
                                                <CheckCircle className="w-3 h-3 text-green-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                        disabled={actionLoading === user.id}
                                    >
                                        {actionLoading === user.id ? (
                                            <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
                                        ) : (
                                            <MoreVertical className="w-5 h-5" />
                                        )}
                                    </button>

                                    {selectedUser === user.id && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#0b0c0f] border border-gray-800 rounded-lg shadow-xl z-10">
                                            <div className="p-2">
                                                <p className="text-xs text-gray-500 px-2 mb-2">Change Role</p>
                                                {(['admin', 'employer', 'recruiter', 'applicant'] as UserRole[]).map((role) => (
                                                    <button
                                                        key={role}
                                                        onClick={() => updateUserRole(user.id, role)}
                                                        disabled={user.role === role}
                                                        className={`w-full text-left px-3 py-2 text-sm rounded-lg capitalize ${user.role === role ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-800'}`}
                                                    >
                                                        {role}
                                                    </button>
                                                ))}
                                                <hr className="my-2 border-gray-800" />
                                                <button
                                                    onClick={() => deleteUser(user.id)}
                                                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete User
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500">No users found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
