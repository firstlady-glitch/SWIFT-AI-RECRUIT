'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowRight } from 'lucide-react';

import { getBlogListItems } from '@/lib/blog-posts';

export default function BlogPage() {
    const posts = getBlogListItems();

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            <section className="pt-32 pb-16 px-6 bg-[var(--background-secondary)] text-center relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-15">
                    <Image
                        src="/announcement.png"
                        alt=""
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
                    {posts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="card overflow-hidden group hover:border-[var(--primary-blue)] transition-all flex flex-col"
                        >
                            <div
                                className={`h-48 w-full flex items-end justify-start p-6 ${post.imageClass}`}
                            >
                                <span className="text-white/90 font-semibold text-sm tracking-wide uppercase">
                                    {post.category}
                                </span>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-center gap-4 text-xs text-[var(--foreground-secondary)] mb-4">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {post.date}
                                    </span>
                                    <span>{post.readTime}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--primary-blue)] transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-[var(--foreground-secondary)] text-sm mb-6 line-clamp-3 flex-1">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground-secondary)]">
                                        <div className="w-8 h-8 bg-[var(--border)] rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4" />
                                        </div>
                                        {post.author}
                                    </div>
                                    <span className="text-[var(--primary-blue)] group-hover:translate-x-1 transition-transform inline-flex">
                                        <ArrowRight className="w-5 h-5" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}
