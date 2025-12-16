'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import {
    FileText, Search, UserCheck, MessageSquare, Briefcase,
    Shield, Code, PenTool, Database, Video, Mail,
    Layout, TrendingUp, Users, Target, Zap,
    Award, Globe, Smartphone, Lock, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ResourcesPage() {
    const router = useRouter();

    const tools = [
        {
            icon: <FileText className="w-8 h-8 text-[var(--primary-blue)]" />,
            name: "AI Resume Builder",
            description: "Create ATS-friendly resumes in minutes with AI suggestions.",
            category: "Job Seekers"
        },
        {
            icon: <Search className="w-8 h-8 text-purple-500" />,
            name: "Smart Job Match",
            description: "Get matched with jobs that perfectly fit your skills.",
            category: "Job Seekers"
        },
        {
            icon: <UserCheck className="w-8 h-8 text-green-500" />,
            name: "Candidate Ranking",
            description: "Automatically rank applicants based on criteria.",
            category: "Employers"
        },
        {
            icon: <MessageSquare className="w-8 h-8 text-pink-500" />,
            name: "Interview Prep AI",
            description: "Practice unlimited mock interviews with feedback.",
            category: "Job Seekers"
        },
        {
            icon: <Briefcase className="w-8 h-8 text-orange-500" />,
            name: "Salary Estimator",
            description: "Real-time market rate analysis for any role.",
            category: "Both"
        },
        {
            icon: <Shield className="w-8 h-8 text-red-500" />,
            name: "Background Check",
            description: "Automated verification for safer hiring.",
            category: "Employers"
        },
        {
            icon: <Code className="w-8 h-8 text-blue-400" />,
            name: "Code Assessment",
            description: "Live coding challenges for dev roles.",
            category: "Employers"
        },
        {
            icon: <PenTool className="w-8 h-8 text-teal-500" />,
            name: "Cover Letter AI",
            description: "Write personalized cover letters instantly.",
            category: "Job Seekers"
        },
        {
            icon: <Database className="w-8 h-8 text-indigo-500" />,
            name: "Skill Taxonomy",
            description: "Standardize skills across your organization.",
            category: "Employers"
        },
        {
            icon: <Video className="w-8 h-8 text-rose-500" />,
            name: "Video Intro",
            description: "Record and share professional video introductions.",
            category: "Job Seekers"
        },
        {
            icon: <Mail className="w-8 h-8 text-yellow-500" />,
            name: "Email Outreach",
            description: "AI-generated outreach templates for recruiters.",
            category: "Employers"
        },
        {
            icon: <Layout className="w-8 h-8 text-cyan-500" />,
            name: "Portfolio Builder",
            description: "Showcase your work with auto-generated portfolios.",
            category: "Job Seekers"
        },
        {
            icon: <TrendingUp className="w-8 h-8 text-emerald-500" />,
            name: "Career Pathing",
            description: "Visualize and plan your career progression.",
            category: "Job Seekers"
        },
        {
            icon: <Users className="w-8 h-8 text-violet-500" />,
            name: "Team Culture Fit",
            description: "Assess candidates for cultural alignment.",
            category: "Employers"
        },
        {
            icon: <Target className="w-8 h-8 text-fuchsia-500" />,
            name: "Job Post Optimizer",
            description: "Write unbiased, high-converting job descriptions.",
            category: "Employers"
        },
        {
            icon: <Zap className="w-8 h-8 text-amber-500" />,
            name: "Instant Apply",
            description: "Apply to multiple jobs with one click.",
            category: "Job Seekers"
        },
        {
            icon: <Award className="w-8 h-8 text-lime-500" />,
            name: "Skill Certification",
            description: "Get verified badges for your top skills.",
            category: "Job Seekers"
        },
        {
            icon: <Globe className="w-8 h-8 text-sky-500" />,
            name: "Visa Checker",
            description: "Check work visa requirements globally.",
            category: "Both"
        },
        {
            icon: <Smartphone className="w-8 h-8 text-slate-500" />,
            name: "Mobile Recruiter",
            description: "Manage your hiring pipeline on the go.",
            category: "Employers"
        },
        {
            icon: <Lock className="w-8 h-8 text-zinc-500" />,
            name: "Privacy Guard",
            description: "Anonymize your profile while job hunting.",
            category: "Job Seekers"
        },
        {
            icon: <BookOpen className="w-8 h-8 text-blue-800" />,
            name: "Learning Hub",
            description: "Curated courses to upskill for your next role.",
            category: "Job Seekers"
        }
    ];

    const handleUseTool = () => {
        // Redirect to register with the persistence flag 'redirectTarget=tools'
        router.push('/auth/register?role=applicant&redirectTarget=tools');
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            {/* Hero */}
            <section className="pt-32 pb-16 px-6 bg-[var(--background-secondary)] text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        AI Recruiting Tools & Resources
                    </h1>
                    <p className="text-xl text-[var(--foreground-secondary)] mb-10 max-w-2xl mx-auto">
                        Supercharge your hiring or job search with our suite of {tools.length}+ intelligent tools.
                        Free to try, powerful to use.
                    </p>
                </div>
            </section>

            {/* Tools Grid */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tools.map((tool, idx) => (
                            <div key={idx} className="card p-8 hover:border-[var(--primary-blue)] transition-all group border border-[var(--border)] bg-[#15171e] flex flex-col items-start">
                                <div className="mb-6 p-4 rounded-2xl bg-[#0b0c0f] border border-[var(--border)] group-hover:scale-110 transition-transform duration-300">
                                    {tool.icon}
                                </div>
                                <div className="mb-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide
                                        ${tool.category === 'Job Seekers' ? 'bg-blue-900/30 text-blue-400' :
                                            tool.category === 'Employers' ? 'bg-purple-900/30 text-purple-400' :
                                                'bg-green-900/30 text-green-400'}`}>
                                        {tool.category}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold mb-3">{tool.name}</h3>
                                <p className="text-[var(--foreground-secondary)] mb-8 flex-grow">
                                    {tool.description}
                                </p>

                                <button
                                    onClick={handleUseTool}
                                    className="w-full py-3 rounded-lg border border-[var(--primary-blue)] text-[var(--primary-blue)] font-medium hover:bg-[var(--primary-blue)] hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-900/20"
                                >
                                    Use Tool <Zap className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
