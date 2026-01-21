'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload } from 'lucide-react';

function RecruiterSetupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedPlan = searchParams.get('plan') || 'free';

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        companyName: '', // Kept backend-side for org name, but mapped from full name
        industry: '',
        location: '',
        specializations: '',
        yearsInBusiness: '',
        logo: null as File | null
    });

    // Pre-fill from user metadata if available
    useEffect(() => {
        const loadUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    fullName: user.user_metadata?.full_name || '',
                    email: user.email || ''
                }));
            }
        };
        loadUser();
    }, []);

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
            console.log('Step 1: Checking if profile exists for user:', user.id);
            const { data: existingProfile, error: profileCheckError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            if (profileCheckError && profileCheckError.code !== 'PGRST116') {
                // PGRST116 = "no rows returned" which is expected if profile doesn't exist
                console.error('Error checking profile:', profileCheckError);
            }

            if (!existingProfile) {
                // Create the profile first if it doesn't exist
                console.log('Step 1b: Profile not found, creating new profile...');
                const { error: createProfileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || '',
                        role: 'recruiter',
                        onboarding_completed: false
                    });

                if (createProfileError) {
                    console.error('Failed to create profile:', createProfileError);
                    throw createProfileError;
                }
                console.log('Step 1b: Profile created successfully');
            } else {
                console.log('Step 1: Profile already exists');
            }

            // STEP 2: Create or update organization (now profile exists)
            console.log('Step 2: Creating organization...');
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .upsert({
                    name: formData.fullName, // Using Name as Org Name for Freelancers
                    email: formData.email,
                    type: 'recruiter',
                    industry: formData.industry,
                    size: '1', // Default to 1 for freelance
                    location: formData.location,
                    specializations: formData.specializations.split(',').map(s => s.trim()),
                    years_in_business: parseInt(formData.yearsInBusiness),
                    logo_url: logoUrl,
                    created_by: user.id
                })
                .select()
                .single();

            if (orgError) {
                console.error('Failed to create organization:', orgError);
                throw orgError;
            }
            console.log('Step 2: Organization created:', org.id);

            // STEP 3: Update user profile with organization and complete onboarding
            console.log('Step 3: Updating profile with organization...');
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    organization_id: org.id,
                    role: 'recruiter',
                    full_name: formData.fullName, // Update profile name
                    onboarding_completed: true
                })
                .eq('id', user.id);

            if (profileError) {
                console.error('Failed to update profile:', profileError);
                throw profileError;
            }
            console.log('Step 3: Profile updated, onboarding complete!');

            const redirectTarget = searchParams.get('redirectTarget');
            const redirectQuery = redirectTarget ? `?redirectTarget=${redirectTarget}` : '';
            const finalUrl = `/app/org/recruiter`;
            console.log('Redirecting to:', finalUrl);
            router.push(finalUrl + redirectQuery);
        } catch (error: any) {
            console.error('Setup error:', error);
            alert('Setup failed: ' + (error.message || JSON.stringify(error)));
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] py-12">
            <div className="max-w-2xl mx-auto px-6">
                <h1 className="text-4xl font-bold mb-4">Recruiter Profile Setup</h1>
                <p className="text-xl text-[var(--foreground-secondary)] mb-8">
                    Complete your profile to start sourcing talent {selectedPlan !== 'free' && <span className="ml-2 inline-block px-2 py-0.5 bg-[var(--primary-blue)] text-white text-xs rounded-full uppercase font-bold tracking-wide align-middle">{selectedPlan} Plan</span>}
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

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                                placeholder="john@example.com"
                            />
                        </div>
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
                        <label htmlFor="location" className="block text-sm font-medium mb-2">
                            Location
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

export default function RecruiterSetupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--background)]">Loading...</div>}>
            <RecruiterSetupContent />
        </Suspense>
    );
}
