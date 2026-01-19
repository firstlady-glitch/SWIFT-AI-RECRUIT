'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStatus('success');
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            <section className="pt-32 pb-20 px-6 bg-[var(--primary-blue)] text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
                    <p className="text-xl text-blue-100">
                        Have questions about our AI solutions? We're here to help you revolutionize your hiring process.
                    </p>
                </div>
            </section>

            <section className="py-20 section">
                <div className="grid md:grid-cols-2 gap-16">
                    {/* Contact Info */}
                    <div>
                        <h2 className="text-3xl font-bold mb-8">Contact Information</h2>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-6 h-6 text-[var(--primary-blue)]" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Email Us</h3>
                                    <p className="text-[var(--foreground-secondary)] mb-1">Our support team is here to help.</p>
                                    <a href="mailto:support@swiftairecruit.com" className="text-[var(--primary-blue)] font-medium">support@swiftairecruit.com</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-6 h-6 text-[var(--accent-orange)]" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Call Us</h3>
                                    <p className="text-[var(--foreground-secondary)] mb-1">Mon-Fri from 8am to 6pm.</p>
                                    <a href="tel:+15551234567" className="text-[var(--primary-blue)] font-medium">+1 (555) 123-4567</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-[var(--success)]" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">Visit Us</h3>
                                    <p className="text-[var(--foreground-secondary)]">
                                        123 Innovation Drive<br />
                                        Tech Valley, CA 94043
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)]">
                            <h4 className="font-bold mb-2">Enterprise Inquires?</h4>
                            <p className="text-sm text-[var(--foreground-secondary)] mb-4">
                                For large organizations with custom needs, contact our sales team directly.
                            </p>
                            <a href="mailto:enterprise@swiftairecruit.com" className="text-[var(--primary-blue)] font-semibold text-sm flex items-center gap-1">
                                Contact Enterprise Sales <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="card p-8 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

                        {status === 'success' ? (
                            <div className="bg-green-50 text-[var(--success)] p-8 rounded-xl text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-6 text-[var(--primary-blue)] font-medium hover:underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">First Name</label>
                                        <input type="text" className="input" placeholder="John" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Last Name</label>
                                        <input type="text" className="input" placeholder="Doe" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Email Address</label>
                                    <input type="email" className="input" placeholder="john@company.com" required />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Subject</label>
                                    <select className="input" required>
                                        <option value="">Select a topic...</option>
                                        <option value="support">Technical Support</option>
                                        <option value="sales">Sales & Pricing</option>
                                        <option value="partnership">Partnership</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Message</label>
                                    <textarea rows={5} className="input resize-none" placeholder="How can we help you?" required></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                                    {!status && <Send className="w-4 h-4" />}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
