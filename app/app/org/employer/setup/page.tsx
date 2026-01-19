'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload } from 'lucide-react';

function EmployerSetupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedPlan = searchParams.get('plan') || 'free';

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        industry: '',
        companySize: '',
        website: '',
        phone: '',
        location: '',
        departments: '',
        description: '',
        logo: null as File | null
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Not authenticated');

            // Upload company logo to Cloudinary if provided
            let logoUrl = null;
            if (formData.logo) {
                const logoFormData = new FormData();
                logoFormData.append('file', formData.logo);
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
                logoUrl = logoData.secure_url;
            }

            // STEP 1: Ensure profile exists first (may have failed during registration)
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            if (!existingProfile) {
                // Create the profile first if it doesn't exist
                const { error: createProfileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || '',
                        role: 'employer',
                        onboarding_completed: false
                    });

                if (createProfileError) throw createProfileError;
            }

            // STEP 2: Create or update organization (now profile exists)
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .upsert({
                    name: formData.companyName,
                    type: 'employer',
                    industry: formData.industry,
                    size: formData.companySize,
                    website: formData.website,
                    phone: formData.phone,
                    location: formData.location,
                    departments: formData.departments.split(',').map(s => s.trim()),
                    description: formData.description,
                    logo_url: logoUrl,
                    created_by: user.id
                })
                .select()
                .single();

            if (orgError) throw orgError;

            // STEP 3: Update user profile with organization and complete onboarding
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    organization_id: org.id,
                    role: 'employer',
                    onboarding_completed: true
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            const redirectTarget = searchParams.get('redirectTarget');
            const redirectQuery = redirectTarget ? `?redirectTarget=${redirectTarget}` : '';
            router.push(`/app/org/employer/${user.id}${redirectQuery}`);
        } catch (error: any) {
            alert(error.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] py-12">
            <div className="max-w-2xl mx-auto px-6">
                <h1 className="text-4xl font-bold mb-4">Setup Your Company Profile</h1>
                <p className="text-xl text-[var(--foreground-secondary)] mb-8">
                    Complete your company profile to start hiring {selectedPlan !== 'free' && <span className="ml-2 inline-block px-2 py-0.5 bg-[var(--primary-blue)] text-white text-xs rounded-full uppercase font-bold tracking-wide align-middle">{selectedPlan} Plan</span>}
                </p>

                <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                    <div>
                        <label htmlFor="logo" className="block text-sm font-medium mb-2">
                            Company Logo (optional)
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                id="logo"
                                accept="image/*"
                                onChange={(e) => e.target.files && setFormData({ ...formData, logo: e.target.files[0] })}
                                className="hidden"
                            />
                            <label
                                htmlFor="logo"
                                className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] cursor-pointer hover:border-[var(--primary-blue)] transition-colors flex items-center justify-center gap-2"
                            >
                                <Upload className="w-5 h-5" />
                                {formData.logo ? formData.logo.name : 'Choose logo or drag here'}
                            </label>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium mb-2">
                            Company Name
                        </label>
                        <input
                            type="text"
                            id="companyName"
                            required
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                            placeholder="Acme Corporation"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="industry" className="block text-sm font-medium mb-2">
                                Industry
                            </label>
                            <input
                                type="text"
                                id="industry"
                                required
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                                placeholder="Technology, Finance, etc."
                            />
                        </div>

                        <div>
                            <label htmlFor="companySize" className="block text-sm font-medium mb-2">
                                Company Size
                            </label>
                            <select
                                id="companySize"
                                required
                                value={formData.companySize}
                                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                            >
                                <option value="">Select size</option>
                                <option value="1-10">1-10 employees</option>
                                <option value="11-50">11-50 employees</option>
                                <option value="51-200">51-200 employees</option>
                                <option value="201-500">201-500 employees</option>
                                <option value="501-1000">501-1000 employees</option>
                                <option value="1001+">1001+ employees</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="departments" className="block text-sm font-medium mb-2">
                            Hiring Departments (comma-separated)
                        </label>
                        <input
                            type="text"
                            id="departments"
                            required
                            value={formData.departments}
                            onChange={(e) => setFormData({ ...formData, departments: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                            placeholder="Engineering, Sales, Marketing"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="website" className="block text-sm font-medium mb-2">
                                Company Website
                            </label>
                            <input
                                type="url"
                                id="website"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                                placeholder="https://company.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium mb-2">
                                Main Phone
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium mb-2">
                            Headquarters Location
                        </label>
                        <input
                            type="text"
                            id="location"
                            required
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                            placeholder="San Francisco, CA"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-2">
                            Company Description
                        </label>
                        <textarea
                            id="description"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                            placeholder="Tell us about your company and culture..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn btn-primary py-4"
                    >
                        {isLoading ? 'Setting up...' : 'Complete Setup'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function EmployerSetupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--background)]">Loading...</div>}>
            <EmployerSetupContent />
        </Suspense>
    );
}
