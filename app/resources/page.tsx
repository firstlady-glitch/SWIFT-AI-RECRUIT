'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import {
    FileText, Search, UserCheck, MessageSquare, Briefcase,
    PenTool, Code, TrendingUp, Mail, Presentation,
    Sparkles, Target, Brain, FileCheck, Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ResourcesPage() {
    const router = useRouter();

    const tools = [
        // Job Seekers Tools
        {
            icon: <FileText className="w-8 h-8 text-emerald-500" />,
            name: "Smart Resume Parser",
            description: "Extract profile data from your resume automatically. Use existing or paste new content.",
            category: "Job Seekers"
        },
        {
            icon: <Sparkles className="w-8 h-8 text-purple-500" />,
            name: "Resume Optimizer",
            description: "Get AI feedback with ATS scoring, keyword analysis, and targeted improvements.",
            category: "Job Seekers"
        },
        {
            icon: <PenTool className="w-8 h-8 text-blue-500" />,
            name: "Cover Letter Generator",
            description: "Write personalized cover letters tailored to specific job postings.",
            category: "Job Seekers"
        },
        {
            icon: <MessageSquare className="w-8 h-8 text-pink-500" />,
            name: "Interview Prep AI",
            description: "Practice with AI-generated interview questions with hints and progress tracking.",
            category: "Job Seekers"
        },
        {
            icon: <Target className="w-8 h-8 text-orange-500" />,
            name: "Job Fit Predictor",
            description: "Compare your profile against jobs to see match score and skill gaps.",
            category: "Job Seekers"
        },

        // Employer Tools
        {
            icon: <FileText className="w-8 h-8 text-blue-500" />,
            name: "JD Generator",
            description: "Create compelling job descriptions with AI-suggested salary ranges.",
            category: "Employers"
        },
        {
            icon: <UserCheck className="w-8 h-8 text-green-500" />,
            name: "Candidate Ranking",
            description: "AI-powered scoring and ranking of applicants for your positions.",
            category: "Employers"
        },
        {
            icon: <MessageSquare className="w-8 h-8 text-purple-500" />,
            name: "Interview Scripts",
            description: "Create structured interview scripts with scoring guides by round.",
            category: "Employers"
        },
        {
            icon: <Brain className="w-8 h-8 text-cyan-500" />,
            name: "Interview Intelligence",
            description: "Analyze interview transcripts and generate structured feedback.",
            category: "Employers"
        },
        {
            icon: <FileCheck className="w-8 h-8 text-emerald-500" />,
            name: "Offer Letter Generator",
            description: "Create professional offer letters for your top candidates.",
            category: "Employers"
        },

        // Recruiter Tools
        {
            icon: <Mail className="w-8 h-8 text-blue-500" />,
            name: "Outreach Email",
            description: "Create personalized outreach emails with candidate profile data.",
            category: "Recruiters"
        },
        {
            icon: <Search className="w-8 h-8 text-purple-500" />,
            name: "Semantic Search",
            description: "Find candidates using natural language queries and AI matching.",
            category: "Recruiters"
        },
        {
            icon: <Code className="w-8 h-8 text-indigo-500" />,
            name: "Boolean Search",
            description: "Generate X-Ray search strings for LinkedIn, Google, and GitHub.",
            category: "Recruiters"
        },
        {
            icon: <Presentation className="w-8 h-8 text-orange-500" />,
            name: "Candidate Pitch",
            description: "Create compelling pitches to sell candidates to hiring managers.",
            category: "Recruiters"
        },
        {
            icon: <TrendingUp className="w-8 h-8 text-green-500" />,
            name: "Pipeline Analytics",
            description: "Monitor pipeline velocity and detect stalled candidates with AI.",
            category: "Recruiters"
        }
    ];

    const handleUseTool = (category: string) => {
        const role = category === 'Job Seekers'
            ? 'applicant'
            : category === 'Employers'
                ? 'employer'
                : 'recruiter';
        router.push(`/auth/register?role=${role}&redirectTarget=tools`);
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Job Seekers': return 'bg-blue-900/30 text-blue-400';
            case 'Employers': return 'bg-purple-900/30 text-purple-400';
            case 'Recruiters': return 'bg-green-900/30 text-green-400';
            default: return 'bg-gray-900/30 text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            {/* Hero */}
            <section className="pt-32 pb-16 px-6 bg-[var(--background-secondary)] text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        AI Recruiting Tools
                    </h1>
                    <p className="text-xl text-[var(--foreground-secondary)] mb-10 max-w-2xl mx-auto">
                        Supercharge your hiring or job search with our suite of {tools.length} intelligent tools.
                        Built with GPT-4 and designed for modern recruiting.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/auth/register?role=applicant"
                            className="btn btn-primary px-8 py-3"
                        >
                            I&apos;m a Job Seeker
                        </Link>
                        <Link
                            href="/auth/register?role=employer"
                            className="btn border border-gray-700 px-8 py-3 hover:bg-gray-800"
                        >
                            I&apos;m Hiring
                        </Link>
                    </div>
                </div>
            </section>

            {/* Category Tabs */}
            <section className="py-8 px-6 border-b border-gray-800">
                <div className="max-w-7xl mx-auto flex justify-center gap-6 flex-wrap">
                    <span className="px-4 py-2 rounded-full bg-blue-900/30 text-blue-400 font-medium">
                        Job Seekers: 5 Tools
                    </span>
                    <span className="px-4 py-2 rounded-full bg-purple-900/30 text-purple-400 font-medium">
                        Employers: 5 Tools
                    </span>
                    <span className="px-4 py-2 rounded-full bg-green-900/30 text-green-400 font-medium">
                        Recruiters: 5 Tools
                    </span>
                </div>
            </section>

            {/* Tools Grid */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tools.map((tool, idx) => (
                            <div
                                key={idx}
                                className="card p-8 hover:border-[var(--primary-blue)] transition-all group border border-[var(--border)] bg-[var(--background-secondary)] flex flex-col items-start"
                            >
                                <div className="mb-6 p-4 rounded-2xl bg-[#0b0c0f] border border-[var(--border)] group-hover:scale-110 transition-transform duration-300">
                                    {tool.icon}
                                </div>
                                <div className="mb-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide ${getCategoryColor(tool.category)}`}>
                                        {tool.category}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold mb-3">{tool.name}</h3>
                                <p className="text-[var(--foreground-secondary)] mb-8 flex-grow">
                                    {tool.description}
                                </p>

                                <button
                                    onClick={() => handleUseTool(tool.category)}
                                    className="w-full py-3 rounded-lg border border-[var(--primary-blue)] text-[var(--primary-blue)] font-medium hover:bg-[var(--primary-blue)] hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-900/20"
                                >
                                    Use Tool <Zap className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-[var(--background-secondary)]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Recruiting?</h2>
                    <p className="text-gray-400 mb-8">
                        Join thousands of recruiters and job seekers using SwiftAI to streamline their process.
                    </p>
                    <Link
                        href="/auth/register"
                        className="btn btn-primary px-8 py-4 text-lg"
                    >
                        Get Started Free
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
