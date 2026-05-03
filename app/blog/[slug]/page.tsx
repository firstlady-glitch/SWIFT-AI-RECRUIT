'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import {
    ArrowLeft,
    Calendar,
    User,
    Clock,
    Share2,
    Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useState } from 'react';

import { getBlogPostBySlug } from '@/lib/blog-posts';

export default function BlogPostPage() {
    const params = useParams();
    const slug = params.slug as string;
    const post = getBlogPostBySlug(slug);
    const [copied, setCopied] = useState(false);

    const articleUrl =
        typeof window !== 'undefined' ? `${window.location.origin}/blog/${slug}` : '';

    const copyLink = useCallback(async () => {
        if (!articleUrl) return;
        try {
            await navigator.clipboard.writeText(articleUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* ignore */
        }
    }, [articleUrl]);

    const shareNative = useCallback(async () => {
        if (!post || !navigator.share) {
            await copyLink();
            return;
        }
        try {
            await navigator.share({
                title: post.title,
                text: post.excerpt,
                url: articleUrl,
            });
        } catch {
            /* user cancelled */
        }
    }, [post, articleUrl, copyLink]);

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-6">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-bold mb-4">Article not found</h1>
                    <p className="text-[var(--foreground-secondary)] mb-6">
                        That slug is not in our library. Choose a post from the blog index.
                    </p>
                    <Link
                        href="/blog"
                        className="text-[var(--primary-blue)] font-medium hover:underline"
                    >
                        Back to blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            <article className="pt-28 pb-20">
                <div className="max-w-3xl mx-auto px-6">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-[var(--foreground-secondary)] hover:text-[var(--primary-blue)] mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Blog
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--foreground-secondary)] mb-6">
                        <span className="bg-[var(--primary-blue)]/15 text-[var(--primary-blue)] px-3 py-1 rounded-full font-medium">
                            {post.category}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" /> {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {post.readTime}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold mb-8 leading-tight text-[var(--foreground)]">
                        {post.title}
                    </h1>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-y border-[var(--border)] py-6 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[var(--background-secondary)] border border-[var(--border)] rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-[var(--foreground-secondary)]" />
                            </div>
                            <div>
                                <div className="font-bold text-[var(--foreground)]">
                                    {post.author}
                                </div>
                                <div className="text-sm text-[var(--foreground-secondary)]">
                                    {post.role}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={shareNative}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background-secondary)] text-sm"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                            <button
                                type="button"
                                onClick={copyLink}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background-secondary)] text-sm"
                            >
                                <LinkIcon className="w-4 h-4" />
                                {copied ? 'Copied' : 'Copy link'}
                            </button>
                        </div>
                    </div>

                    <div
                        className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-[var(--primary-blue)] prose-img:rounded-xl mb-12 text-[var(--foreground)]"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] p-6 text-center">
                        <p className="text-[var(--foreground-secondary)] text-sm mb-4">
                            Product questions or press? We read everything that lands in the inbox.
                        </p>
                        <Link href="/contact" className="btn btn-primary inline-flex">
                            Contact the team
                        </Link>
                    </div>
                </div>
            </article>

            <section className="bg-[var(--primary-blue)] text-white py-16">
                <div className="section text-center max-w-2xl mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-4">Stay in the loop</h2>
                    <p className="text-blue-100 mb-8">
                        We do not run a bulk newsletter yet. For product updates, reach out via the
                        contact page or WhatsApp and we will add you to release notes.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex bg-white text-[var(--primary-blue)] px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                    >
                        Request updates
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
