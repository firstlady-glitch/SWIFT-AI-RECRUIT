'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building2, User, CreditCard, Save, Loader2, Globe, MapPin, Phone, FileText, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ErrorState } from '@/components/ui/ErrorState';

export default function RecruiterSettings() {
    const params = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        location: '',
        linkedin_url: '',
        website: '',
        job_title: '',
        experience_years: 0,
        specializations: [] as string[],
    });

    const [orgData, setOrgData] = useState({
        name: '',
        website: '',
        phone: '',
        location: '',
        description: '',
        specializations: [] as string[],
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            // Fetch profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*, organization:organizations(*)')
                .eq('id', user.id)
                .single();

            if (profile) {
                setFormData({
                    full_name: profile.full_name || '',
                    email: profile.email || '',
                    phone: profile.phone || '',
                    location: profile.location || '',
                    linkedin_url: profile.linkedin_url || '',
                    website: profile.website || '',
                    job_title: profile.job_title || '',
                    experience_years: profile.experience_years || 0,
                    specializations: profile.skills || [],
                });

                const org = Array.isArray(profile.organization) ? profile.organization[0] : profile.organization;
                if (org) {
                    setOrgData({
                        name: org.name || '',
                        website: org.website || '',
                        phone: org.phone || '',
                        location: org.location || '',
                        description: org.description || '',
                        specializations: org.specializations || [],
                    });
                }
            }
        } catch (err: any) {
            console.error('[Settings] Error:', err);
            setError('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(false);

        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    location: formData.location,
                    linkedin_url: formData.linkedin_url,
                    website: formData.website,
                    job_title: formData.job_title,
                    experience_years: formData.experience_years,
                    skills: formData.specializations,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAgency = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(false);

        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!profile?.organization_id) return;

            const { error: updateError } = await supabase
                .from('organizations')
                .update({
                    name: orgData.name,
                    website: orgData.website,
                    phone: orgData.phone,
                    location: orgData.location,
                    description: orgData.description,
                    specializations: orgData.specializations,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', profile.organization_id);

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const openStripePortal = async () => {
        try {
            const res = await fetch('/api/stripe/portal', { method: 'POST' });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (err) {
            console.error('Failed to open billing portal');
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 max-w-6xl mx-auto">
                <div className="h-8 w-48 bg-gray-800 rounded animate-pulse mb-8" />
                <div className="h-96 bg-gray-800 rounded-xl animate-pulse" />
            </div>
        );
    }

    if (error && !formData.full_name) return <ErrorState message={error} onRetry={fetchData} />;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-gray-400 mb-8">Manage your profile and agency settings.</p>

            <div className="grid md:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="bg-[#15171e] rounded-xl border border-gray-800 h-fit">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 p-4 border-b border-gray-800 transition-colors ${activeTab === 'profile' ? 'bg-purple-500/10 text-purple-400' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <User className="w-5 h-5" /> My Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('agency')}
                        className={`w-full flex items-center gap-3 p-4 border-b border-gray-800 transition-colors ${activeTab === 'agency' ? 'bg-purple-500/10 text-purple-400' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <Briefcase className="w-5 h-5" /> Agency Details
                    </button>
                    <button
                        onClick={() => setActiveTab('billing')}
                        className={`w-full flex items-center gap-3 p-4 transition-colors ${activeTab === 'billing' ? 'bg-purple-500/10 text-purple-400' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <CreditCard className="w-5 h-5" /> Subscription
                    </button>
                </div>

                {/* Content */}
                <div className="md:col-span-3">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div className="card p-6 border border-gray-800 bg-[#15171e]">
                                <h3 className="text-xl font-bold mb-6">Your Profile</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm opacity-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Location</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">LinkedIn</label>
                                        <input
                                            type="url"
                                            value={formData.linkedin_url}
                                            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                            className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Experience (years)</label>
                                        <input
                                            type="number"
                                            value={formData.experience_years}
                                            onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {success && <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">✓ Profile updated!</div>}
                            {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}

                            <div className="flex justify-end">
                                <button onClick={handleSaveProfile} disabled={isSaving} className="btn btn-primary px-6 py-2 flex items-center gap-2">
                                    {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Profile</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'agency' && (
                        <div className="space-y-6">
                            <div className="card p-6 border border-gray-800 bg-[#15171e]">
                                <h3 className="text-xl font-bold mb-6">Agency Details</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Agency Name</label>
                                        <input
                                            type="text"
                                            value={orgData.name}
                                            onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                                            className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Website</label>
                                        <input
                                            type="url"
                                            value={orgData.website}
                                            onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                                            className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-gray-400 mb-2">Description</label>
                                        <textarea
                                            value={orgData.description}
                                            onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                                            className="w-full h-32 bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button onClick={handleSaveAgency} disabled={isSaving} className="btn btn-primary px-6 py-2 flex items-center gap-2">
                                    {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Agency</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="card p-6 border border-gray-800 bg-[#15171e]">
                            <h3 className="text-xl font-bold mb-4">Subscription</h3>
                            <p className="text-gray-400 mb-6">Manage your subscription and billing through Stripe.</p>
                            <button onClick={openStripePortal} className="btn btn-primary flex items-center gap-2">
                                <CreditCard className="w-4 h-4" /> Manage Billing
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
