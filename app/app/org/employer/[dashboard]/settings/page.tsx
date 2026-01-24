'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building2, Users, CreditCard, Save, Loader2, Globe, MapPin, Phone, FileText, Upload } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ErrorState } from '@/components/ui/ErrorState';
import { useSettings } from '@/hooks/use-site-settings';
import type { Organization } from '@/types';

export default function EmployerSettings() {
    const params = useParams();
    const router = useRouter();
    const { settings: siteSettings } = useSettings();
    const [activeTab, setActiveTab] = useState('company');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        website: '',
        phone: '',
        location: '',
        industry: '',
        size: '',
        description: '',
        logo_url: '',
        departments: [] as string[],
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchOrganization();
    }, []);

    const fetchOrganization = async () => {
        setIsLoading(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!profile?.organization_id) {
                router.push('/app/org/employer/setup');
                return;
            }

            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', profile.organization_id)
                .single();

            if (orgError) throw orgError;

            setFormData({
                name: org.name || '',
                website: org.website || '',
                phone: org.phone || '',
                location: org.location || '',
                industry: org.industry || '',
                size: org.size || '',
                description: org.description || '',
                logo_url: org.logo_url || '',
                departments: org.departments || [],
            });
            if (org.logo_url) {
                setLogoPreview(org.logo_url);
            }
        } catch (err: any) {
            console.error('[Settings] Error:', err);
            setError('Failed to load organization');
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

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!profile?.organization_id) return;

            // Upload new logo if selected
            let newLogoUrl = formData.logo_url;
            if (logoFile) {
                const logoFormData = new FormData();
                logoFormData.append('file', logoFile);
                logoFormData.append('upload_preset', 'profiles');
                logoFormData.append('folder', `company-logos/${user.id}`);

                const logoResponse = await fetch(
                    'https://api.cloudinary.com/v1_1/drw5se2tr/image/upload',
                    {
                        method: 'POST',
                        body: logoFormData
                    }
                );

                if (!logoResponse.ok) throw new Error('Logo upload failed');

                const logoData = await logoResponse.json();
                newLogoUrl = logoData.secure_url;
            }

            const { error: updateError } = await supabase
                .from('organizations')
                .update({
                    name: formData.name,
                    website: formData.website,
                    phone: formData.phone,
                    location: formData.location,
                    industry: formData.industry,
                    size: formData.size,
                    description: formData.description,
                    logo_url: newLogoUrl,
                    departments: formData.departments,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', profile.organization_id);

            if (updateError) throw updateError;

            // Clear the file input after successful upload
            setLogoFile(null);
            setFormData({ ...formData, logo_url: newLogoUrl });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            console.log('[Settings] Organization updated');
        } catch (err: any) {
            console.error('[Settings] Error:', err);
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
            }
        } catch (err) {
            console.error('Failed to open billing portal');
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

    if (error && !formData.name) return <ErrorState message={error} onRetry={fetchOrganization} />;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Company Settings</h1>
            <p className="text-[var(--foreground-secondary)] mb-8">Update your company profile and manage your subscription.</p>

            <div className="grid md:grid-cols-4 gap-8">
                {/* Settings Sidebar */}
                <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] h-fit">
                    <button
                        onClick={() => setActiveTab('company')}
                        className={`w-full flex items-center gap-3 p-4 border-b border-[var(--border)] transition-colors ${activeTab === 'company' ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]' : 'hover:bg-[var(--border)] text-[var(--foreground-secondary)]'}`}
                    >
                        <Building2 className="w-5 h-5" /> Company Profile
                    </button>
                    <Link
                        href={`/app/org/employer/${params.dashboard}/team`}
                        className="w-full flex items-center gap-3 p-4 border-b border-[var(--border)] hover:bg-[var(--border)] text-[var(--foreground-secondary)] transition-colors"
                    >
                        <Users className="w-5 h-5" /> Team Members
                    </Link>
                    {siteSettings.payments_enabled && (
                        <button
                            onClick={() => setActiveTab('billing')}
                            className={`w-full flex items-center gap-3 p-4 transition-colors ${activeTab === 'billing' ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]' : 'hover:bg-[var(--border)] text-[var(--foreground-secondary)]'}`}
                        >
                            <CreditCard className="w-5 h-5" /> Subscription
                        </button>
                    )}
                    <Link
                        href={`/app/org/employer/${params.dashboard}/profile`}
                        className="w-full flex items-center gap-3 p-4 border-t border-[var(--border)] hover:bg-[var(--border)] text-[var(--foreground-secondary)] transition-colors mt-auto"
                        target="_blank"
                    >
                        <Globe className="w-5 h-5" /> View Public Profile
                    </Link>
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    {activeTab === 'company' && (
                        <div className="space-y-6">
                            <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                                <h3 className="text-xl font-bold mb-6">Company Details</h3>

                                {/* Logo */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">Company Logo</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-xl bg-[var(--background)] border border-[var(--border)] overflow-hidden flex items-center justify-center">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="w-10 h-10 text-gray-600" />
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                id="logo-upload"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setLogoFile(file);
                                                        setLogoPreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor="logo-upload"
                                                className="btn btn-secondary px-4 py-2 cursor-pointer text-sm"
                                            >
                                                Change Logo
                                            </label>
                                            <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                            <Building2 className="w-4 h-4 inline mr-1" /> Company Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--foreground)]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                            <Globe className="w-4 h-4 inline mr-1" /> Website
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--foreground)]"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                            <Phone className="w-4 h-4 inline mr-1" /> Phone
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
                                        <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">Industry</label>
                                        <select
                                            value={formData.industry}
                                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--foreground)]"
                                        >
                                            <option value="">Select Industry</option>
                                            <option value="Technology">Technology</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Education">Education</option>
                                            <option value="Manufacturing">Manufacturing</option>
                                            <option value="Retail">Retail</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">Company Size</label>
                                        <select
                                            value={formData.size}
                                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--foreground)]"
                                        >
                                            <option value="">Select Size</option>
                                            <option value="1-10">1-10 employees</option>
                                            <option value="11-50">11-50 employees</option>
                                            <option value="51-200">51-200 employees</option>
                                            <option value="201-500">201-500 employees</option>
                                            <option value="501-1000">501-1000 employees</option>
                                            <option value="1000+">1000+ employees</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">Departments</label>
                                        <input
                                            type="text"
                                            value={formData.departments.join(', ')}
                                            onChange={(e) => setFormData({ ...formData, departments: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                            placeholder="Engineering, Marketing, Sales, HR"
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--foreground)]"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Separate departments with commas</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                            <FileText className="w-4 h-4 inline mr-1" /> Company Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full h-32 bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-sm resize-none text-[var(--foreground)]"
                                            placeholder="Tell candidates about your company..."
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
                                    ✓ Company profile updated successfully!
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !formData.name}
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

                    {activeTab === 'billing' && (
                        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
                            <h3 className="text-xl font-bold mb-4">Subscription</h3>
                            <p className="text-gray-400 mb-6">Manage your subscription and billing through Stripe.</p>

                            <button
                                onClick={openStripePortal}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                <CreditCard className="w-4 h-4" /> Manage Billing
                            </button>

                            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <p className="text-sm text-blue-400">
                                    Use the billing portal to update payment methods, view invoices, and manage your subscription.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
