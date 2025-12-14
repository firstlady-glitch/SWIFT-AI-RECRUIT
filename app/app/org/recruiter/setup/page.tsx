'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload } from 'lucide-react'; // Assuming lucide-react for the Upload icon

export default function RecruiterSetupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        industry: '',
        companySize: '',
        website: '',
        phone: '',
        location: '',
        specializations: '',
        yearsInBusiness: '',
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

            // Create or update organization
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .upsert({
                    name: formData.companyName,
                    type: 'recruiter',
                    industry: formData.industry,
                    size: formData.companySize,
                    website: formData.website,
                    phone: formData.phone,
                    location: formData.location,
                    specializations: formData.specializations.split(',').map(s => s.trim()),
                    years_in_business: parseInt(formData.yearsInBusiness),
                    logo_url: logoUrl,
                    created_by: user.id
                })
                .select()
                .single();

            if (orgError) throw orgError;

            // Update user profile
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    organization_id: org.id,
                    role: 'recruiter',
                    onboarding_completed: true
                });

            if (profileError) throw profileError;

            router.push(`/app/app/org/recruiter/${user.id}`);
        } catch (error: any) {
            alert(error.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] py-12">
            <div className="max-w-2xl mx-auto px-6">
                <h1 className="text-4xl font-bold mb-4">Setup Your Recruitment Agency</h1>
                <p className="text-xl text-[var(--foreground-secondary)] mb-8">
                    Complete your agency profile to start sourcing talent
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
                            Agency Name
                        </label>
                        <input
                            type="text"
                            id="companyName"
                            required
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                            placeholder="TalentSource Recruiters"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="industry" className="block text-sm font-medium mb-2">
                                Primary Industry Focus
                            </label>
                            <input
                                type="text"
                                id="industry"
                                required
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                                placeholder="Technology, Healthcare, etc."
                            />
                        </div>

                        <div>
                            <label htmlFor="yearsInBusiness" className="block text-sm font-medium mb-2">
                                Years in Business
                            </label>
                            <input
                                type="number"
                                id="yearsInBusiness"
                                required
                                min="0"
                                value={formData.yearsInBusiness}
                                onChange={(e) => setFormData({ ...formData, yearsInBusiness: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                                placeholder="5"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="specializations" className="block text-sm font-medium mb-2">
                            Specializations (comma-separated)
                        </label>
                        <input
                            type="text"
                            id="specializations"
                            required
                            value={formData.specializations}
                            onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                            placeholder="Executive Search, IT Staffing, Sales Recruitment"
                        />
                    </div>

                    <div>
                        <label htmlFor="companySize" className="block text-sm font-medium mb-2">
                            Team Size
                        </label>
                        <select
                            id="companySize"
                            required
                            value={formData.companySize}
                            onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                        >
                            <option value="">Select size</option>
                            <option value="1-5">1-5 recruiters</option>
                            <option value="6-10">6-10 recruiters</option>
                            <option value="11-25">11-25 recruiters</option>
                            <option value="26-50">26-50 recruiters</option>
                            <option value="51+">51+ recruiters</option>
                        </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="website" className="block text-sm font-medium mb-2">
                                Website
                            </label>
                            <input
                                type="url"
                                id="website"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                                placeholder="https://example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium mb-2">
                                Business Phone
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
                            Office Location
                        </label>
                        <input
                            type="text"
                            id="location"
                            required
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                            placeholder="New York, NY"
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
