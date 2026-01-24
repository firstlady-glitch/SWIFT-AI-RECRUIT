'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User, Bell, Shield, Wallet, Save, Loader2, CreditCard, MapPin, Briefcase, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ErrorState } from '@/components/ui/ErrorState';

export default function ApplicantSettings() {
    const router = useRouter();
    const params = useParams();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        job_title: '',
        location: '',
        phone: '',
        linkedin_url: '',
        website: '',
        profile_image_url: '',
        experience_years: 0,
        skills: [] as string[],
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [notifications, setNotifications] = useState({
        application_status: true,
        job_recommendations: true,
        interview_reminders: true,
        marketing: false,
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;

            setFormData({
                full_name: profile.full_name || '',
                email: profile.email || user.email || '',
                job_title: profile.job_title || '',
                location: profile.location || '',
                phone: profile.phone || '',
                linkedin_url: profile.linkedin_url || '',
                website: profile.website || '',
                profile_image_url: profile.profile_image_url || '',
                experience_years: profile.experience_years || 0,
                skills: profile.skills || [],
            });
            if (profile.profile_image_url) {
                setImagePreview(profile.profile_image_url);
            }
        } catch (err: any) {
            console.error('[Settings] Error:', err);
            setError('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(false);

        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Upload image if selected
            let newProfileImageUrl = formData.profile_image_url;
            if (imageFile) {
                const imageFormData = new FormData();
                imageFormData.append('file', imageFile);
                imageFormData.append('upload_preset', 'profiles');
                imageFormData.append('folder', `user-avatars/${user.id}`);

                const imageResponse = await fetch(
                    'https://api.cloudinary.com/v1_1/drw5se2tr/image/upload',
                    {
                        method: 'POST',
                        body: imageFormData
                    }
                );

                if (!imageResponse.ok) throw new Error('Image upload failed');

                const imageData = await imageResponse.json();
                newProfileImageUrl = imageData.secure_url;
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    job_title: formData.job_title,
                    location: formData.location,
                    phone: formData.phone,
                    linkedin_url: formData.linkedin_url,
                    website: formData.website,
                    profile_image_url: newProfileImageUrl,
                    experience_years: formData.experience_years,
                    skills: formData.skills,
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

    const openStripePortal = async () => {
        try {
            const res = await fetch('/api/stripe/portal', { method: 'POST' });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else if (data.redirect) {
                router.push('/pricing?role=applicant');
            }
        } catch (err) {
            router.push('/pricing?role=applicant');
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 max-w-6xl mx-auto">
                <div className="h-8 w-48 bg-gray-800 rounded animate-pulse mb-8" />
                <div className="grid md:grid-cols-4 gap-8">
                    <div className="h-48 bg-gray-800 rounded-xl animate-pulse" />
                    <div className="md:col-span-3 h-96 bg-gray-800 rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    if (error && !formData.email) return <ErrorState message={error} onRetry={fetchProfile} />;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
            <p className="text-[var(--foreground-secondary)] mb-8">Manage your profile and preferences.</p>

            <div className="grid md:grid-cols-4 gap-8">
                {/* Settings Sidebar */}
                <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] h-fit">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 p-4 border-b border-[var(--border)] transition-colors ${activeTab === 'profile' ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]' : 'hover:bg-[var(--border)] text-[var(--foreground-secondary)]'}`}
                    >
                        <User className="w-5 h-5" /> Profile Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center gap-3 p-4 border-b border-[var(--border)] transition-colors ${activeTab === 'notifications' ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]' : 'hover:bg-[var(--border)] text-[var(--foreground-secondary)]'}`}
                    >
                        <Bell className="w-5 h-5" /> Notifications
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 p-4 border-b border-[var(--border)] transition-colors ${activeTab === 'security' ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]' : 'hover:bg-[var(--border)] text-[var(--foreground-secondary)]'}`}
                    >
                        <Shield className="w-5 h-5" /> Login & Security
                    </button>
                    <button
                        onClick={() => setActiveTab('billing')}
                        className={`w-full flex items-center gap-3 p-4 transition-colors ${activeTab === 'billing' ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]' : 'hover:bg-[var(--border)] text-[var(--foreground-secondary)]'}`}
                    >
                        <Wallet className="w-5 h-5" /> Subscription
                    </button>
                    <Link
                        href={`/app/applicant/${params.dashboard}/profile/${params.dashboard}`} // Assuming profile/${id} works, and user ID is likely the dashboard ID for applicants
                        className="w-full flex items-center gap-3 p-4 border-t border-[var(--border)] hover:bg-[var(--border)] text-[var(--foreground-secondary)] transition-colors mt-auto"
                        target="_blank"
                    >
                        <User className="w-5 h-5" /> View Public Profile
                    </Link>
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                                <h3 className="text-xl font-bold mb-6">Personal Information</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                            <User className="w-4 h-4 inline mr-1" /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--foreground)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                            <Briefcase className="w-4 h-4 inline mr-1" /> Job Title
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.job_title}
                                            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--foreground)]"
                                            placeholder="e.g., Senior React Developer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                            <MapPin className="w-4 h-4 inline mr-1" /> Location
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--foreground)]"
                                            placeholder="City, Country"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--foreground)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                            <LinkIcon className="w-4 h-4 inline mr-1" /> LinkedIn URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.linkedin_url}
                                            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--foreground)]"
                                            placeholder="https://linkedin.com/in/..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                            Years of Experience
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.experience_years}
                                            onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--foreground)]"
                                            min={0}
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                                    ✓ Profile updated successfully!
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="btn btn-primary px-6 py-2 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                    ) : (
                                        <><Save className="w-4 h-4" /> Save Changes</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <h3 className="text-xl font-bold mb-6">Notification Preferences</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg bg-[var(--background)]">
                                    <div>
                                        <div className="font-medium text-[var(--foreground)]">Application Status Updates</div>
                                        <div className="text-sm text-[var(--foreground-secondary)]">Get notified when your application status changes</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.application_status}
                                        onChange={(e) => setNotifications({ ...notifications, application_status: e.target.checked })}
                                        className="w-5 h-5"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg bg-[var(--background)]">
                                    <div>
                                        <div className="font-medium text-[var(--foreground)]">Job Recommendations</div>
                                        <div className="text-sm text-[var(--foreground-secondary)]">Weekly AI curated job suggestions</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.job_recommendations}
                                        onChange={(e) => setNotifications({ ...notifications, job_recommendations: e.target.checked })}
                                        className="w-5 h-5"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg bg-[var(--background)]">
                                    <div>
                                        <div className="font-medium text-[var(--foreground)]">Interview Reminders</div>
                                        <div className="text-sm text-[var(--foreground-secondary)]">Get reminded before scheduled interviews</div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifications.interview_reminders}
                                        onChange={(e) => setNotifications({ ...notifications, interview_reminders: e.target.checked })}
                                        className="w-5 h-5"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <h3 className="text-xl font-bold mb-6">Security Settings</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm opacity-50 text-[var(--foreground)]"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Contact support to change your email</p>
                                </div>
                                <div className="pt-4 border-t border-[var(--border)]">
                                    <button className="text-[var(--primary-blue)] hover:underline text-sm">
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <h3 className="text-xl font-bold mb-4">Subscription</h3>
                            <p className="text-[var(--foreground-secondary)] mb-6">
                                Manage your subscription and billing through our secure payment portal.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={openStripePortal}
                                    className="btn btn-primary flex items-center gap-2"
                                >
                                    <CreditCard className="w-4 h-4" /> Manage Billing
                                </button>
                                <Link href="/pricing?role=applicant" className="btn btn-secondary flex items-center gap-2">
                                    View Plans
                                </Link>
                            </div>

                            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <p className="text-sm text-blue-400">
                                    Upgrade to Pro for unlimited AI resume builds, cover letter generator, and priority job matching.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
