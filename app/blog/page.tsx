'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowRight } from 'lucide-react';

export default function BlogPage() {
    const posts = [
        {
            title: "The Future of AI in Recruitment: Trends to Watch in 2025",
            excerpt: "How Artificial Intelligence is reshaping the hiring landscape, from automated sourcing to emotional intelligence analysis in interviews.",
            author: "Sarah Johnson",
            date: "Dec 12, 2024",
            category: "Industry Trends",
            image: "bg-blue-100",
            slug: "future-of-ai-recruitment"
        },
        {
            title: "5 Tips to Beat the ATS and Get Hired",
            excerpt: "Learn how Applicant Tracking Systems work and how to optimize your resume to ensure it gets seen by human eyes.",
            author: "Mike Chen",
            date: "Dec 10, 2024",
            category: "Job Seeker Tips",
            image: "bg-orange-100",
            slug: "beat-the-ats"
        },
        {
            title: "Why Soft Skills Matter More Than Ever in the AI Era",
            excerpt: "As technical tasks become automated, human-centric skills like empathy, leadership, and creativity are becoming the new gold standard.",
            author: "Jessica Williams",
            date: "Dec 05, 2024",
            category: "Career Advice",
            image: "bg-green-100",
            slug: "soft-skills-matter"
        },
        {
            title: "Case Study: How TechCorp Reduced Hiring Time by 60%",
            excerpt: "A deep dive into how a leading tech giant utilized SwiftAI Recruit to streamline their engineering hiring pipeline.",
            author: "David Miller",
            date: "Nov 28, 2024",
            category: "Case Studies",
            image: "bg-purple-100",
            slug: "techcorp-case-study"
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            <section className="pt-32 pb-16 px-6 bg-[var(--background-secondary)] text-center relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-15">
                    <Image
                        src="/announcement.png"
                        alt="Blog Background"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                </div>
                <div className="max-w-3xl mx-auto relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">SwiftAI Blog</h1>
                    <p className="text-xl text-[var(--foreground-secondary)]">
                        Insights, advice, and news from the world of AI recruitment.
                    </p>
                </div>
            </section>

            <section className="py-20 section">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, idx) => (
                        <div key={idx} className="card overflow-hidden group hover:border-[var(--primary-blue)] transition-all">
                            <div className={`h-48 ${post.image} w-full flex items-center justify-center text-[var(--primary-blue)] opacity-15`}>
                                {/* Placeholder for actual blog image */}
                                <span className="font-bold text-lg">Blog Image</span>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-4 text-xs text-[var(--foreground-secondary)] mb-4">
                                    <span className="bg-blue-50 text-[var(--primary-blue)] px-2 py-1 rounded-md font-medium">
                                        {post.category}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {post.date}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--primary-blue)] transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-[var(--foreground-secondary)] text-sm mb-6 line-clamp-3">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-gray-500" />
                                        </div>
                                        {post.author}
                                    </div>
                                    <Link href={`/blog/${post.slug}`} className="text-[var(--primary-blue)] hover:translate-x-1 transition-transform">
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <button className="btn btn-outline">Load More Articles</button>
                </div>
            </section>

            <Footer />
        </div>
    );
}
