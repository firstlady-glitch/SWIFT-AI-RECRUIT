'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Mail, Phone, Send, ArrowRight } from 'lucide-react';
import { whatsAppChatUrl } from '@/lib/whatsapp';
import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fallbackMailto, setFallbackMailto] = useState<string | null>(null);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMessage(null);
        setFallbackMailto(null);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    subject: form.subject,
                    message: form.message,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                setStatus('success');
                return;
            }

            if (res.status === 503 && data.fallback && typeof data.mailto === 'string') {
                setFallbackMailto(data.mailto);
                setErrorMessage(
                    data.error ||
                        'Automatic delivery is offline. Open your email app with the button below.'
                );
                setStatus('error');
                return;
            }

            setErrorMessage(
                typeof data.error === 'string'
                    ? data.error
                    : 'Something went wrong. Please try WhatsApp or email.'
            );
            setStatus('error');
        } catch {
            setErrorMessage('Network error. Check your connection or use WhatsApp.');
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            <section className="pt-32 pb-20 px-6 bg-[var(--primary-blue)] text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
                    <p className="text-xl text-blue-100">
                        Have questions about our AI solutions? We route every message to the team.
                    </p>
                </div>
            </section>

            <section className="py-20 section">
                <div className="grid md:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-3xl font-bold mb-8">Contact Information</h2>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-6 h-6 text-[var(--primary-blue)]" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Email Us</h3>
                                    <p className="text-[var(--foreground-secondary)] mb-1">
                                        Our support team is here to help.
                                    </p>
                                    <a
                                        href="mailto:support@swiftairecruit.com"
                                        className="text-[var(--primary-blue)] font-medium"
                                    >
                                        support@swiftairecruit.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-6 h-6 text-[var(--accent-orange)]" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">WhatsApp</h3>
                                    <p className="text-[var(--foreground-secondary)] mb-1">
                                        Remote team — message us anytime; we reply on working hours
                                        (WAT/GMT).
                                    </p>
                                    <a
                                        href={whatsAppChatUrl('Hello SwiftAI Recruit')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[var(--primary-blue)] font-medium"
                                    >
                                        +234 901 921 2601 (chat on WhatsApp)
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)]">
                            <h4 className="font-bold mb-2">Enterprise Inquires?</h4>
                            <p className="text-sm text-[var(--foreground-secondary)] mb-4">
                                For large organizations with custom needs, contact our sales team
                                directly.
                            </p>
                            <a
                                href="mailto:enterprise@swiftairecruit.com"
                                className="text-[var(--primary-blue)] font-semibold text-sm flex items-center gap-1"
                            >
                                Contact Enterprise Sales <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    <div className="card p-8 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

                        {status === 'success' ? (
                            <div className="bg-green-50 dark:bg-green-950/30 text-[var(--success)] p-8 rounded-xl text-center border border-green-200/50">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                                <p className="text-[var(--foreground-secondary)]">
                                    Thank you for reaching out. We typically respond within one
                                    business day.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatus('idle');
                                        setForm({
                                            firstName: '',
                                            lastName: '',
                                            email: '',
                                            subject: '',
                                            message: '',
                                        });
                                    }}
                                    className="mt-6 text-[var(--primary-blue)] font-medium hover:underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {errorMessage && (
                                    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-[var(--foreground)]">
                                        <p className="mb-2">{errorMessage}</p>
                                        {fallbackMailto && (
                                            <a
                                                href={fallbackMailto}
                                                className="font-semibold text-[var(--primary-blue)] underline"
                                            >
                                                Open in email app
                                            </a>
                                        )}
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="John"
                                            required
                                            value={form.firstName}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    firstName: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Doe"
                                            required
                                            value={form.lastName}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    lastName: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="input"
                                        placeholder="john@company.com"
                                        required
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, email: e.target.value }))
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Subject
                                    </label>
                                    <select
                                        className="input"
                                        required
                                        value={form.subject}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, subject: e.target.value }))
                                        }
                                    >
                                        <option value="">Select a topic...</option>
                                        <option value="support">Technical Support</option>
                                        <option value="sales">Sales & Pricing</option>
                                        <option value="partnership">Partnership</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        rows={5}
                                        className="input resize-none"
                                        placeholder="How can we help you?"
                                        required
                                        value={form.message}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, message: e.target.value }))
                                        }
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                                    {status !== 'sending' && <Send className="w-4 h-4" />}
                                </button>

                                <p className="text-xs text-[var(--foreground-secondary)] text-center">
                                    Prefer chat?{' '}
                                    <Link
                                        href={whatsAppChatUrl()}
                                        className="text-[var(--primary-blue)] underline"
                                    >
                                        WhatsApp
                                    </Link>
                                    .
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
