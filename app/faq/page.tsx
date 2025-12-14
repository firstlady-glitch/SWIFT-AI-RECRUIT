'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Plus, Minus, Search } from 'lucide-react';
import { faqData } from './faq-data';

export default function FAQPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'jobseekers' | 'employers'>('general');
    const [searchTerm, setSearchTerm] = useState('');

    const currentFaqs = faqData[activeTab].filter(item =>
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            <section className="pt-32 pb-20 px-6 bg-[var(--background-secondary)] text-center relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10">
                    <Image
                        src="/faqs.png"
                        alt="FAQ Background"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
                    <p className="text-xl text-[var(--foreground-secondary)] max-w-2xl mx-auto mb-8">
                        Everything you need to know about SwiftAI Recruit. Can't find the answer you're looking for? <Link href="/contact" className="text-[var(--primary-blue)] hover:underline">Contact our support team.</Link>
                    </p>
                    <div className="relative max-w-2xl mx-auto mb-8">
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            className="w-full py-4 pl-6 pr-14 rounded-full border border-gray-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="absolute right-2 top-2 bottom-2 bg-[var(--primary-blue)] text-white p-3 rounded-full hover:bg-blue-600 transition-colors">
                            <Search className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </section>

            <div className="sticky top-[72px] z-40 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
                <div className="max-w-4xl mx-auto px-6 overflow-x-auto">
                    <div className="flex items-center justify-center gap-6 md:gap-12 min-w-max py-4">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`text-lg font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'general' ? 'border-[var(--primary-blue)] text-[var(--primary-blue)]' : 'border-transparent text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'}`}
                        >
                            General
                        </button>
                        <button
                            onClick={() => setActiveTab('jobseekers')}
                            className={`text-lg font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'jobseekers' ? 'border-[var(--primary-blue)] text-[var(--primary-blue)]' : 'border-transparent text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'}`}
                        >
                            <span className="flex items-center gap-2">Job Seekers <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{faqData.jobseekers.length}</span></span>
                        </button>
                        <button
                            onClick={() => setActiveTab('employers')}
                            className={`text-lg font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'employers' ? 'border-[var(--primary-blue)] text-[var(--primary-blue)]' : 'border-transparent text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'}`}
                        >
                            <span className="flex items-center gap-2">Employers <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{faqData.employers.length}</span></span>
                        </button>
                    </div>
                </div>
            </div>

            <section className="py-12 section max-w-3xl mx-auto min-h-[500px]">
                <div className="space-y-4">
                    {currentFaqs.length > 0 ? (
                        currentFaqs.map((faq, idx) => (
                            <FAQItem key={idx} question={faq.q} answer={faq.a} />
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-[var(--foreground-secondary)] text-lg">No results found for "{searchTerm}".</p>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="card border border-[var(--border)] overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-[var(--background-secondary)] transition-colors"
            >
                <span className="font-semibold text-lg pr-4">{question}</span>
                {isOpen ? <Minus className="w-5 h-5 text-[var(--primary-blue)] flex-shrink-0" /> : <Plus className="w-5 h-5 text-[var(--foreground-secondary)] flex-shrink-0" />}
            </button>
            {isOpen && (
                <div className="px-6 pb-6 text-[var(--foreground-secondary)] animate-in slide-in-from-top-2 leading-relaxed">
                    {answer}
                </div>
            )}
        </div>
    );
}
