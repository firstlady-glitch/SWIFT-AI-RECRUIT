'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin, ThumbsUp, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

// Mock Data
const BLOG_POSTS = [
    {
        slug: "future-of-ai-recruitment",
        title: "The Future of AI in Recruitment: Trends to Watch in 2025",
        author: "Sarah Johnson",
        role: "Head of Product",
        date: "Dec 12, 2024",
        readTime: "5 min read",
        category: "Industry Trends",
        content: `
            <p class="mb-6">The recruitment landscape is undergoing a seismic shift. As we approach 2025, Artificial Intelligence is no longer just a buzzword—it's the backbone of modern hiring strategies. But what does this mean for recruiters and candidates?</p>
            
            <h2 class="text-2xl font-bold mb-4 text-gray-900">1. Beyond Keyword Matching</h2>
            <p class="mb-6">Traditional Applicant Tracking Systems (ATS) relied heavily on exact keyword matching, often rejecting qualified candidates simply because they used "Manage" instead of "Lead". The next generation of AI matching engines, like SwiftAI Recruit, utilizes Semantic Search and Large Language Models (LLMs) to understand the *context* of a career.</p>
            
            <h2 class="text-2xl font-bold mb-4 text-gray-900">2. Bias Reduction at Scale</h2>
            <p class="mb-6">One of the most promising applications of AI is its ability to blind-screen resumes. By removing demographic data and focusing purely on skills and experience, companies are seeing a 40% increase in diverse hires.</p>
            
            <h2 class="text-2xl font-bold mb-4 text-gray-900">3. The Rise of "Soft Skills" Analysis</h2>
            <p class="mb-6">As technical assessments become automated, the human element becomes even more critical. New AI tools can analyze interview transcripts for indicators of empathy, leadership, and adaptability—skills that are notoriously hard to quantify.</p>
            
            <div class="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500 mb-8">
                <p class="font-medium text-blue-800 italic">"The goal of AI isn't to replace the recruiter. It's to free them from the mundane, so they can focus on the human connection."</p>
            </div>

            <p>The future is bright for those who embrace these tools. At SwiftAI Recruit, we're committed to building this future responsibly.</p>
        `
    },
    {
        slug: "beat-the-ats",
        title: "5 Tips to Beat the ATS and Get Hired",
        author: "Mike Chen",
        role: "Senior Recruiter",
        date: "Dec 10, 2024",
        readTime: "4 min read",
        category: "Job Seeker Tips",
        content: `
             <p class="mb-6">Applicant Tracking Systems (ATS) are used by 99% of Fortune 500 companies. If your resume isn't optimized, it might never be seen by a human. Here is how to ensure you make the cut.</p>
             
             <h3 class="text-xl font-bold mb-3 text-gray-900">1. Use Standard Formatting</h3>
             <p class="mb-6">Avoid columns, graphics, and tables. Simple, linear layouts are the easiest for parsers to read.</p>
             
             <h3 class="text-xl font-bold mb-3 text-gray-900">2. Tailor Your Keywords</h3>
             <p class="mb-6">Read the job description carefully. If they ask for "Project Management", don't just say "Led Projects". Use the exact terminology.</p>
             
              <h3 class="text-xl font-bold mb-3 text-gray-900">3. Save as .docx or PDF</h3>
             <p class="mb-6">While most modern systems handle PDF well, Word documents are still the safest bet for older legacy systems.</p>
        `
    }
    // Add other posts...
];

export default function BlogPostPage() {
    const params = useParams();
    const slug = params.slug;
    const post = BLOG_POSTS.find(p => p.slug === slug);

    const [likes, setLikes] = useState(124);
    const [isLiked, setIsLiked] = useState(false);

    const handleLike = () => {
        if (isLiked) {
            setLikes(likes - 1);
        } else {
            setLikes(likes + 1);
        }
        setIsLiked(!isLiked);
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
                    <Link href="/blog" className="text-[var(--primary-blue)] hover:underline">Read other articles</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            {/* Progress Bar (Visual) */}
            <div className="fixed top-0 left-0 w-full h-1 z-50">
                <div className="h-full bg-[var(--primary-blue)] w-1/3"></div>
            </div>

            <article className="pt-32 pb-20">
                <div className="max-w-3xl mx-auto px-6">
                    {/* Back Link */}
                    <Link href="/blog" className="inline-flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Blog
                    </Link>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-[var(--foreground-secondary)] mb-6">
                        <span className="bg-blue-100 text-[var(--primary-blue)] px-3 py-1 rounded-full font-medium">{post.category}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.readTime}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl font-bold mb-8 leading-tight text-[var(--foreground)]">{post.title}</h1>

                    {/* Author */}
                    <div className="flex items-center justify-between border-y border-[var(--border)] py-6 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-500" />
                            </div>
                            <div>
                                <div className="font-bold text-[var(--foreground)]">{post.author}</div>
                                <div className="text-sm text-[var(--foreground-secondary)]">{post.role}</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"><Linkedin className="w-5 h-5" /></button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"><Twitter className="w-5 h-5" /></button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"><Share2 className="w-5 h-5" /></button>
                        </div>
                    </div>

                    {/* Content */}
                    <div
                        className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-[var(--primary-blue)] prose-img:rounded-xl mb-12"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Engagement */}
                    <div className="flex items-center justify-center gap-8 py-8 border-t border-[var(--border)]">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all ${isLiked ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-[var(--border)] hover:bg-gray-50'}`}
                        >
                            <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                            <span className="font-bold">{likes}</span>
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border)] hover:bg-gray-50 transition-all">
                            <MessageCircle className="w-5 h-5" />
                            <span className="font-bold">Comment</span>
                        </button>
                    </div>
                </div>
            </article>

            {/* Newsletter CTA */}
            <section className="bg-[var(--primary-blue)] text-white py-16">
                <div className="section text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold mb-4">Subscribe to our newsletter</h2>
                    <p className="text-blue-100 mb-8">Get the latest insights on AI and recruitment delivered straight to your inbox.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input type="email" placeholder="Enter your email" className="px-6 py-3 rounded-lg text-black w-full focus:outline-none focus:ring-2 focus:ring-blue-300" />
                        <button className="bg-white text-[var(--primary-blue)] px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">Subscribe</button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
