'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { User, MapPin, Briefcase, Mail, Phone, Linkedin, Globe, ArrowLeft, MessageSquare } from 'lucide-react';
import type { Profile } from '@/types';

export default function EmployerViewProfilePage() {
    const params = useParams();
    const router = useRouter();
    const targetId = params.id as string;
    const dashboardId = params.dashboard as string;

    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [targetId]);

    const fetchProfile = async () => {
        setIsLoading(true);
        const supabase = createClient();

        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', targetId)
                .single();

            if (profileError) throw profileError;
            setProfile(profileData);

        } catch (err: any) {
            console.error('[EmployerViewProfile] Error:', err);
            setError('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMessage = async () => {
        if (!profile) return;
        setIsCreatingConversation(true);
        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId: profile.id })
            });

            if (!res.ok) throw new Error('Failed to start conversation');
            router.push(`/app/org/employer/${dashboardId}/messages`);
        } catch (err) {
            console.error('Error starting conversation:', err);
            alert('Failed to start conversation');
        } finally {
            setIsCreatingConversation(false);
        }
    };

    if (isLoading) return <div className="p-8"><LoadingState type="card" count={1} /></div>;
    if (error || !profile) return <div className="p-8"><ErrorState message={error || 'Profile not found'} /></div>;

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>

                {/* Profile Header */}
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8 mb-6">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-32 h-32 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center overflow-hidden flex-shrink-0">
                            {profile.profile_image_url ? (
                                <img src={profile.profile_image_url} alt={profile.full_name || 'Profile'} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-[var(--foreground-secondary)]" />
                            )}
                        </div>

                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">{profile.full_name || 'Unnamed User'}</h1>
                                    {profile.job_title && (
                                        <p className="text-xl text-[var(--foreground-secondary)]">{profile.job_title}</p>
                                    )}
                                </div>
                                <button
                                    onClick={handleMessage}
                                    disabled={isCreatingConversation}
                                    className="btn btn-primary px-6 py-2 flex items-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    {isCreatingConversation ? 'Starting...' : 'Message'}
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-[var(--foreground-secondary)]">
                                {profile.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" /> {profile.location}
                                    </span>
                                )}
                                {profile.experience_years && profile.experience_years > 0 && (
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="w-4 h-4" /> {profile.experience_years} years experience
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {profile.email && (
                            <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)]">
                                <Mail className="w-4 h-4" /> {profile.email}
                            </a>
                        )}
                        {profile.phone && (
                            <a href={`tel:${profile.phone}`} className="flex items-center gap-3 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)]">
                                <Phone className="w-4 h-4" /> {profile.phone}
                            </a>
                        )}
                        {profile.linkedin_url && (
                            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)]">
                                <Linkedin className="w-4 h-4" /> LinkedIn Profile
                            </a>
                        )}
                        {profile.website && (
                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)]">
                                <Globe className="w-4 h-4" /> {profile.website}
                            </a>
                        )}
                    </div>
                </div>

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)]">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Resume */}
                {profile.resume_url && (
                    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4">Resume</h2>
                        <a
                            href={profile.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary inline-flex items-center gap-2"
                        >
                            View Resume
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}