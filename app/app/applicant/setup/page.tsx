'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, Check, X, ArrowRight, ArrowLeft, Search, Plus, Trash2, Lock } from 'lucide-react';
import { SKILLS_DATA } from './skills-data';

function ApplicantSetupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL or defaults
    const [step, setStep] = useState<'plan' | 'profile'>(
        (searchParams.get('stage') as 'plan' | 'profile') || 'plan'
    );
    const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'free');
    const [isLoading, setIsLoading] = useState(false);
    const [acceptPayments, setAcceptPayments] = useState(false);

    // Fetch payment config
    useEffect(() => {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => setAcceptPayments(data.acceptPayments))
            .catch(() => { });
    }, []);

    // Skills Modal State
    const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
    const [skillSearchQuery, setSkillSearchQuery] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [customSkill, setCustomSkill] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        phone: '',
        location: '',
        jobTitle: '',
        experience: '',
        linkedinUrl: '',
        profileImage: null as File | null,
        resume: null as File | null
    });

    // Hydration from LocalStorage
    useEffect(() => {
        const savedData = localStorage.getItem('applicant_setup_form');
        const savedSkills = localStorage.getItem('applicant_setup_skills');

        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                // Exclude file objects as they can't be serialized to localStorage
                setFormData(prev => ({
                    ...prev,
                    phone: parsed.phone || '',
                    location: parsed.location || '',
                    jobTitle: parsed.jobTitle || '',
                    experience: parsed.experience || '',
                    linkedinUrl: parsed.linkedinUrl || ''
                }));
            } catch (e) {
                console.error("Failed to parse saved form data", e);
            }
        }

        if (savedSkills) {
            try {
                setSelectedSkills(JSON.parse(savedSkills));
            } catch (e) {
                console.error("Failed to parse saved skills", e);
            }
        }
    }, []);

    // Persistence to LocalStorage
    useEffect(() => {
        const dataToSave = {
            phone: formData.phone,
            location: formData.location,
            jobTitle: formData.jobTitle,
            experience: formData.experience,
            linkedinUrl: formData.linkedinUrl
        };
        localStorage.setItem('applicant_setup_form', JSON.stringify(dataToSave));
    }, [formData]);

    useEffect(() => {
        localStorage.setItem('applicant_setup_skills', JSON.stringify(selectedSkills));
    }, [selectedSkills]);

    // Update URL when step or plan changes
    useEffect(() => {
        const currentParams = new URLSearchParams(searchParams.toString());
        const newParams = new URLSearchParams(currentParams);

        if (step === 'profile') {
            newParams.set('stage', 'completing');
            newParams.set('plan', selectedPlan);
        } else {
            newParams.delete('stage');
            newParams.delete('plan');
        }

        // Ensure redirectTarget is preserved if it exists
        const redirectTarget = searchParams.get('redirectTarget');
        if (redirectTarget) {
            newParams.set('redirectTarget', redirectTarget);
        }

        // Only replace if the params string has actually changed
        if (currentParams.toString() !== newParams.toString()) {
            router.replace(`?${newParams.toString()}`);
        }
    }, [step, selectedPlan, router, searchParams]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, resume: e.target.files[0] });
        }
    };

    const handlePlanSelect = (plan: string) => {
        if (plan !== 'free') return; // Gate paid plans
        setSelectedPlan(plan);
        setStep('profile');
    };

    // Skills Logic
    const filteredSkills = useMemo(() => {
        if (!skillSearchQuery) return SKILLS_DATA.slice(0, 50); // Show top 50 initially
        return SKILLS_DATA.filter(skill =>
            skill.toLowerCase().includes(skillSearchQuery.toLowerCase())
        ).slice(0, 50); // Limit results for performance
    }, [skillSearchQuery]);

    const toggleSkill = (skill: string) => {
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter(s => s !== skill));
        } else {
            if (selectedSkills.length >= 15) return;
            setSelectedSkills([...selectedSkills, skill]);
        }
    };

    const addCustomSkill = () => {
        if (!customSkill.trim()) return;
        if (selectedSkills.includes(customSkill.trim())) return;
        if (selectedSkills.length >= 15) return;

        setSelectedSkills([...selectedSkills, customSkill.trim()]);
        setCustomSkill('');
    };

    const removeSkill = (skillToRemove: string) => {
        setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
    };

    // Close modal on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsSkillsModalOpen(false);
            }
        };

        if (isSkillsModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSkillsModalOpen]);


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
            // Note: In a real app, we would also save the selectedPlan here
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    phone: formData.phone,
                    location: formData.location,
                    job_title: formData.jobTitle,
                    experience_years: parseInt(formData.experience),
                    skills: selectedSkills, // Use the array directly
                    linkedin_url: formData.linkedinUrl,
                    profile_image_url: profileImageUrl,
                    resume_url: resumeUrl,
                    role: 'applicant',
                    onboarding_completed: true
                });

            if (profileError) throw profileError;

            // Clear local storage on success
            localStorage.removeItem('applicant_setup_form');
            localStorage.removeItem('applicant_setup_skills');

            // Redirect to dashboard
            const redirectTarget = searchParams.get('redirectTarget');
            const redirectQuery = redirectTarget ? `?redirectTarget=${redirectTarget}` : '';
            router.push(`/app/applicant/${user.id}${redirectQuery}`);
        } catch (error: any) {
            alert(error.message);
            setIsLoading(false);
        }
    };

    if (step === 'plan') {
        return (
            <div className="min-h-screen bg-[var(--background)] py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">Choose Your Path</h1>
                        <p className="text-xl text-[var(--foreground-secondary)]">
                            Select a plan to accelerate your job search
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Free Plan */}
                        <div className="card p-8 border border-[var(--border)] hover:border-[var(--primary-blue)] transition-all">
                            <h3 className="text-xl font-bold mb-2">Basic</h3>
                            <p className="text-[var(--foreground-secondary)] text-sm mb-6">For casual checking</p>
                            <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-[var(--foreground-secondary)] font-normal">/mo</span></div>

                            <button onClick={() => handlePlanSelect('free')} className="btn btn-outline w-full mb-8">Continue Free</button>

                            <ul className="space-y-4 text-left text-sm">
                                <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> 1 AI Resume Build</li>
                                <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Basic Job Matching</li>
                                <li className="flex gap-3 text-gray-400"><X className="w-5 h-5" /> Cover Letter Generator</li>
                                <li className="flex gap-3 text-gray-400"><X className="w-5 h-5" /> Priority Support</li>
                            </ul>
                        </div>

                        {/* Starter Plan */}
                        <div className={`card p-8 border border-[var(--border)] relative overflow-hidden ${!acceptPayments ? 'opacity-75 group' : ''}`}>
                            {!acceptPayments && (
                                <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                    <Lock className="w-12 h-12 text-white mb-2" />
                                    <span className="text-white font-bold text-lg">Coming Soon</span>
                                </div>
                            )}

                            <h3 className="text-xl font-bold mb-2">Starter</h3>
                            <p className="text-[var(--foreground-secondary)] text-sm mb-6">For individuals just starting out</p>
                            <div className="text-4xl font-bold mb-6">$15<span className="text-lg text-[var(--foreground-secondary)] font-normal">/mo</span></div>

                            <button
                                onClick={() => acceptPayments && handlePlanSelect('starter')}
                                disabled={!acceptPayments}
                                className={`btn w-full mb-8 ${acceptPayments ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
                            >
                                {acceptPayments ? 'Select Plan' : 'Coming Soon'}
                            </button>

                            <ul className="space-y-4 text-left text-sm">
                                <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> 5 AI Resume Builds</li>
                                <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Basic Job Matching</li>
                                <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Application Tracking</li>
                                <li className="flex gap-3 text-gray-400"><X className="w-5 h-5" /> Cover Letter Generator</li>
                            </ul>
                        </div>

                        {/* Professional Plan */}
                        <div className={`card p-8 border-2 border-[var(--primary-blue)]/30 relative transform md:-translate-y-4 shadow-xl overflow-hidden ${!acceptPayments ? 'opacity-75 group' : ''}`}>
                            <div className="absolute top-0 right-0 left-0 bg-[var(--primary-blue)] text-white text-xs font-bold py-1 rounded-t-lg text-center">MOST POPULAR</div>
                            {!acceptPayments && (
                                <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                    <Lock className="w-12 h-12 text-white mb-2" />
                                    <span className="text-white font-bold text-lg">Coming Soon</span>
                                </div>
                            )}

                            <h3 className="text-xl font-bold mb-2 mt-2">Professional</h3>
                            <p className="text-[var(--foreground-secondary)] text-sm mb-6">For serious job seekers</p>
                            <div className="text-4xl font-bold mb-6">$30<span className="text-lg text-[var(--foreground-secondary)] font-normal">/mo</span></div>

                            <button
                                onClick={() => acceptPayments && handlePlanSelect('pro')}
                                disabled={!acceptPayments}
                                className={`btn w-full mb-8 ${acceptPayments ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
                            >
                                {acceptPayments ? 'Select Plan' : 'Coming Soon'}
                            </button>

                            <ul className="space-y-4 text-left text-sm">
                                <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Unlimited AI Resumes</li>
                                <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Priority Matching</li>
                                <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Cover Letter Generator</li>
                                <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Interview AI Practice</li>
                                <li className="flex gap-3"><Check className="w-5 h-5 text-[var(--success)]" /> Email Support</li>
                            </ul>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <button
                            onClick={() => handlePlanSelect('free')}
                            className="text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] underline"
                        >
                            Skip and complete profile
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)] py-12 relative">
            <div className="max-w-4xl mx-auto px-6">
                <div className="mb-10 text-center md:text-left">
                    <button onClick={() => setStep('plan')} className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] flex items-center gap-1 mb-4 mx-auto md:mx-0">
                        <ArrowLeft className="w-4 h-4" /> Back to plans
                    </button>
                    <h1 className="text-4xl font-bold mb-4">Complete Your Profile</h1>
                    <p className="text-xl text-[var(--foreground-secondary)]">
                        Let's set up your {selectedPlan !== 'free' ? 'premium ' : ''}job seeker profile
                        {selectedPlan !== 'free' && <span className="ml-3 inline-block px-3 py-1 bg-[var(--primary-blue)] text-white text-sm rounded-full uppercase font-bold tracking-wide">{selectedPlan} Plan</span>}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="card p-8 md:p-10 shadow-lg">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Column: Personal & Contact */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold border-b pb-2 mb-4">Contact Information</h3>

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
                        </div>

                        {/* Right Column: Professional Info */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold border-b pb-2 mb-4">Professional Details</h3>

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
                                <label className="block text-sm font-medium mb-2">
                                    Key Skills (Max 15)
                                </label>
                                <div
                                    onClick={() => setIsSkillsModalOpen(true)}
                                    className="w-full min-h-[50px] px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] cursor-pointer hover:border-[var(--primary-blue)] flex flex-wrap gap-2"
                                >
                                    {selectedSkills.length === 0 && (
                                        <span className="text-[var(--foreground-secondary)]">Select relevant skills...</span>
                                    )}
                                    {selectedSkills.map(skill => (
                                        <span key={skill} className="px-2 py-1 bg-[var(--primary-blue)]/10 text-[var(--primary-blue)] rounded-md text-sm flex items-center gap-1">
                                            {skill}
                                            <X
                                                className="w-3 h-3 cursor-pointer hover:text-red-500"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeSkill(skill);
                                                }}
                                            />
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-[var(--foreground-secondary)] mt-1">
                                    {selectedSkills.length}/15 skills selected
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Full Width Uploads Section */}
                    <div className="mt-8 pt-8 border-t border-[var(--border)]">
                        <h3 className="text-xl font-bold mb-6">Documents & Media</h3>
                        <div className="grid md:grid-cols-2 gap-8">
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
                                        className="w-full h-32 px-4 py-3 rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground)] cursor-pointer hover:border-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/5 transition-all flex flex-col items-center justify-center gap-2"
                                    >
                                        <Upload className="w-8 h-8 text-[var(--foreground-secondary)]" />
                                        <span className="text-sm font-medium">{formData.profileImage ? formData.profileImage.name : 'Upload Profile Photo'}</span>
                                    </label>
                                </div>
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
                                        className="w-full h-32 px-4 py-3 rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground)] cursor-pointer hover:border-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/5 transition-all flex flex-col items-center justify-center gap-2"
                                    >
                                        <Upload className="w-8 h-8 text-[var(--foreground-secondary)]" />
                                        <span className="text-sm font-medium">{formData.resume ? formData.resume.name : 'Upload Resume (PDF/DOC)'}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary py-4 px-12 text-lg shadow-lg shadow-blue-500/20"
                        >
                            {isLoading ? 'Setting up...' : 'Complete Setup'} <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                </form>

                {/* Skills Modal */}
                {isSkillsModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div
                            ref={modalRef}
                            className="bg-[var(--background)] w-full max-w-2xl rounded-2xl shadow-2xl border border-[var(--border)] flex flex-col max-h-[85vh]"
                        >
                            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-[var(--foreground)]">Select Skills</h2>
                                <button
                                    onClick={() => setIsSkillsModalOpen(false)}
                                    className="p-2 hover:bg-[var(--background-secondary)] rounded-full transition-colors text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                                {/* Selected Skills Area */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-[var(--foreground-secondary)] mb-3 flex justify-between">
                                        <span>Selected Skills</span>
                                        <span className={selectedSkills.length >= 15 ? 'text-red-400' : 'text-[var(--foreground-secondary)]'}>
                                            {selectedSkills.length}/15
                                        </span>
                                    </h3>
                                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                                        {selectedSkills.map(skill => (
                                            <span key={skill} className="px-3 py-1.5 bg-[var(--primary-blue)] text-white rounded-full text-sm flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                                                {skill}
                                                <X
                                                    className="w-3.5 h-3.5 cursor-pointer hover:text-blue-200"
                                                    onClick={() => removeSkill(skill)}
                                                />
                                            </span>
                                        ))}
                                        {selectedSkills.length === 0 && (
                                            <span className="text-[var(--foreground-secondary)] italic text-sm py-1.5">No skills selected yet</span>
                                        )}
                                    </div>
                                </div>

                                {/* Search & Custom Input */}
                                <div className="relative mb-6">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={skillSearchQuery}
                                        onChange={(e) => setSkillSearchQuery(e.target.value)}
                                        placeholder="Search skills (e.g. React, Marketing, Design)..."
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent transition-all"
                                        autoFocus
                                    />
                                    {skillSearchQuery && !filteredSkills.find(s => s.toLowerCase() === skillSearchQuery.toLowerCase()) && (
                                        <button
                                            onClick={() => {
                                                addCustomSkill();
                                                setSkillSearchQuery(''); // Optional: clear search after adding
                                            }}
                                            disabled={selectedSkills.length >= 15}
                                            className="absolute inset-y-2 right-2 px-4 bg-[var(--background)] hover:bg-[var(--border)] text-[var(--foreground)] border border-[var(--border)] rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" /> Add "{skillSearchQuery}"
                                        </button>
                                    )}
                                </div>

                                {/* Skills Grid */}
                                <div>
                                    <h3 className="text-sm font-medium text-[var(--foreground-secondary)] mb-3">Suggested Skills</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {filteredSkills.map(skill => (
                                            <button
                                                key={skill}
                                                onClick={() => toggleSkill(skill)}
                                                disabled={selectedSkills.length >= 15 && !selectedSkills.includes(skill)}
                                                className={`
                                                    px-4 py-3 rounded-xl text-left text-sm transition-all border
                                                    ${selectedSkills.includes(skill)
                                                        ? 'bg-[var(--primary-blue)]/20 border-[var(--primary-blue)] text-[var(--primary-blue)] ring-1 ring-[var(--primary-blue)]'
                                                        : 'bg-[var(--background-secondary)] border-[var(--border)] text-[var(--foreground-secondary)] hover:border-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                                                    }
                                                    disabled:opacity-40 disabled:cursor-not-allowed
                                                `}
                                            >
                                                {skill}
                                            </button>
                                        ))}
                                        {filteredSkills.length === 0 && (
                                            <div className="col-span-full text-center py-8 text-gray-500">
                                                No matching skills found. <br />
                                                <button
                                                    onClick={() => {
                                                        setCustomSkill(skillSearchQuery);
                                                        addCustomSkill();
                                                        setSkillSearchQuery('');
                                                    }}
                                                    className="text-[var(--primary-blue)] hover:underline mt-2"
                                                >
                                                    Add "{skillSearchQuery}" as custom skill
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-[var(--border)] bg-[var(--background-secondary)]/50 flex justify-end">
                                <button
                                    onClick={() => setIsSkillsModalOpen(false)}
                                    className="btn btn-primary px-8 py-3"
                                >
                                    Done Selecting
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ApplicantSetupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--background)]">Loading...</div>}>
            <ApplicantSetupContent />
        </Suspense>
    );
}

