'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload } from 'lucide-react';

export default function ApplicantSetupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        phone: '',
        location: '',
        jobTitle: '',
        experience: '',
        skills: '',
        linkedinUrl: '',
        profileImage: null as File | null,
        resume: null as File | null
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, resume: e.target.files[0] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Not authenticated');

            // Upload profile image to Cloudinary if provided
            let profileImageUrl = null;
            if (formData.profileImage) {
                const imageFormData = new FormData();
                imageFormData.append('file', formData.profileImage);
                imageFormData.append('upload_preset', 'profiles');
                imageFormData.append('folder', `profiles/${user.id}`);

                const imageResponse = await fetch(
                    'https://api.cloudinary.com/v1_1/drw5se2tr/image/upload',
                    {
                        method: 'POST',
                        body: imageFormData
                    }
                );

                if (!imageResponse.ok) throw new Error('Profile image upload failed');

                const imageData = await imageResponse.json();
                profileImageUrl = imageData.secure_url;
            }

            // Upload resume to Cloudinary if provided
            let resumeUrl = null;
            if (formData.resume) {
                const cloudinaryFormData = new FormData();
                cloudinaryFormData.append('file', formData.resume);
                cloudinaryFormData.append('upload_preset', 'resumes'); // You'll need to create this preset in Cloudinary
                cloudinaryFormData.append('folder', `resumes/${user.id}`);

                const cloudinaryResponse = await fetch(
                    'https://api.cloudinary.com/v1_1/drw5se2tr/auto/upload',
                    {
                        method: 'POST',
                        body: cloudinaryFormData
                    }
                );

                if (!cloudinaryResponse.ok) throw new Error('Resume upload failed');

                const cloudinaryData = await cloudinaryResponse.json();
                resumeUrl = cloudinaryData.secure_url;
            }

            // Create profile in database
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    phone: formData.phone,
                    location: formData.location,
                    job_title: formData.jobTitle,
                    experience_years: parseInt(formData.experience),
                    skills: formData.skills.split(',').map(s => s.trim()),
                    linkedin_url: formData.linkedinUrl,
                    profile_image_url: profileImageUrl,
                    resume_url: resumeUrl,
                    role: 'applicant',
                    onboarding_completed: true
                });

            if (profileError) throw profileError;

            // Redirect to dashboard
            router.push(`/app/app/applicant/${user.id}`);
        } catch (error: any) {
            alert(error.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] py-12">
            <div className="max-w-2xl mx-auto px-6">
                <h1 className="text-4xl font-bold mb-4">Complete Your Profile</h1>
                <p className="text-xl text-[var(--foreground-secondary)] mb-8">
                    Let's set up your job seeker profile to get started
                </p>

                <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium mb-2">
                                Phone Number
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
                    </div>

                    <div>
                        <label htmlFor="jobTitle" className="block text-sm font-medium mb-2">
                            Current/Desired Job Title
                        </label>
                        <input
                            type="text"
                            id="jobTitle"
                            required
                            value={formData.jobTitle}
                            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                            placeholder="Software Engineer"
                        />
                    </div>

                    <div>
                        <label htmlFor="experience" className="block text-sm font-medium mb-2">
                            Years of Experience
                        </label>
                        <select
                            id="experience"
                            required
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                        >
                            <option value="">Select experience</option>
                            <option value="0">0-1 years</option>
                            <option value="1">1-3 years</option>
                            <option value="3">3-5 years</option>
                            <option value="5">5-10 years</option>
                            <option value="10">10+ years</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="skills" className="block text-sm font-medium mb-2">
                            Key Skills (comma-separated)
                        </label>
                        <input
                            type="text"
                            id="skills"
                            required
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                            placeholder="React, Node.js, TypeScript"
                        />
                    </div>

                    <div>
                        <label htmlFor="profileImage" className="block text-sm font-medium mb-2">
                            Profile Image (optional)
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                id="profileImage"
                                accept="image/*"
                                onChange={(e) => e.target.files && setFormData({ ...formData, profileImage: e.target.files[0] })}
                                className="hidden"
                            />
                            <label
                                htmlFor="profileImage"
                                className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] cursor-pointer hover:border-[var(--primary-blue)] transition-colors flex items-center justify-center gap-2"
                            >
                                <Upload className="w-5 h-5" />
                                {formData.profileImage ? formData.profileImage.name : 'Choose image or drag here'}
                            </label>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="linkedinUrl" className="block text-sm font-medium mb-2">
                            LinkedIn Profile (optional)
                        </label>
                        <input
                            type="url"
                            id="linkedinUrl"
                            value={formData.linkedinUrl}
                            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                            placeholder="https://linkedin.com/in/username"
                        />
                    </div>

                    <div>
                        <label htmlFor="resume" className="block text-sm font-medium mb-2">
                            Upload Resume (optional)
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                id="resume"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="resume"
                                className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] cursor-pointer hover:border-[var(--primary-blue)] transition-colors flex items-center justify-center gap-2"
                            >
                                <Upload className="w-5 h-5" />
                                {formData.resume ? formData.resume.name : 'Choose file or drag here'}
                            </label>
                        </div>
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
