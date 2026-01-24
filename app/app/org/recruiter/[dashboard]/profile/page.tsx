'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { User, MapPin, Globe, Linkedin, Briefcase, Mail, Phone, Edit } from 'lucide-react';
import Link from 'next/link';

export default function RecruiterProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            setProfile(data);

        } catch (err: any) {
            console.error('[RecruiterProfile] Error:', err);
            setError('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-8"><LoadingState type="card" count={1} /></div>;
    if (error || !profile) return <div className="p-8"><ErrorState message={error || 'Profile not found'} /></div>;

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">My Profile Preview</h1>
                    <Link
                        href={`/app/org/recruiter/dashboard/settings`}
                        className="btn border border-[var(--border)] hover:bg-[var(--border)] flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" /> Edit Profile
                    </Link>
                </div>

                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-blue-900 to-purple-900 opacity-50" />
                    <div className="p-8 relative">
                        {/* Avatar */}
                        <div className="absolute -top-16 left-8">
                            <div className="w-32 h-32 rounded-full bg-gray-800 border-4 border-[var(--background-secondary)] flex items-center justify-center overflow-hidden">
                                {profile.profile_image_url ? (
                                    <img src={profile.profile_image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-gray-500" />
                                )}
                            </div>
                        </div>

                        <div className="mt-16">
                            <h1 className="text-3xl font-bold text-white mb-1">{profile.full_name}</h1>
                            <p className="text-xl text-gray-400 mb-6">{profile.job_title || 'Recruiter'}</p>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Contact Info</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                            {profile.email}
                                        </div>
                                        {profile.phone && (
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <Phone className="w-4 h-4 text-gray-500" />
                                                {profile.phone}
                                            </div>
                                        )}
                                        {profile.location && (
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                {profile.location}
                                            </div>
                                        )}
                                        {profile.linkedin_url && (
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <Linkedin className="w-4 h-4 text-blue-400" />
                                                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn Profile</a>
                                            </div>
                                        )}
                                        {profile.website && (
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <Globe className="w-4 h-4 text-blue-400" />
                                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">Website</a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Professional Info</h3>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Experience</p>
                                        <p className="text-white">{profile.experience_years} years</p>
                                    </div>
                                    {profile.skills && profile.skills.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-400 mb-2">Specializations</p>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.skills.map((skill: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// note : my created jobs should be visible here, my description should be visible here, my company description should be visible here, my company logo should be visible here 