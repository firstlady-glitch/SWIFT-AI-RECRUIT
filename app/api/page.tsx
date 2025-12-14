'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Copy, Terminal, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function APIPage() {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText('npm install @swift-ai/sdk');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Navigation />

            <section className="pt-32 pb-20 px-6 bg-[#0f1117] text-white">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-block px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-xs font-bold mb-6 border border-blue-800">
                            DEVELOPER PREVIEW
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Build with the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">SwiftAI API</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-8">
                            Integrate our powerful matching engine, resume parser, and candidate searching capabilities directly into your own applications.
                        </p>
                        <div className="flex gap-4">
                            <button className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                                Get API Keys
                            </button>
                            <button className="px-6 py-3 rounded-lg font-bold border border-gray-700 hover:bg-gray-800 transition-colors">
                                Read Docs
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#1e212b] rounded-xl border border-gray-800 shadow-2xl overflow-hidden font-mono text-sm">
                        <div className="flex items-center justify-between px-4 py-3 bg-[#2a2e3b] border-b border-gray-700">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <span className="text-gray-400">bash</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between group">
                                <code className="text-green-400">$ npm install @swift-ai/sdk</code>
                                <button onClick={copyToClipboard} className="text-gray-500 hover:text-white transition-colors">
                                    {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>

                            <div className="border-t border-gray-700 pt-4 mt-4">
                                <p className="text-gray-400 mb-2">// Initialize the client</p>
                                <p className="text-blue-300">import <span className="text-white">{`{ SwiftClient }`}</span> from <span className="text-green-300">'@swift-ai/sdk'</span>;</p>
                                <p className="mb-4 text-white">const client = new SwiftClient(process.env.SWIFT_API_KEY);</p>

                                <p className="text-gray-400 mb-2">// Match candidates</p>
                                <p className="text-purple-300">const<span className="text-white"> matches = </span>await<span className="text-blue-300"> client.jobs.match</span><span className="text-white">({`{`}</span></p>
                                <p className="pl-4 text-white">jobId: <span className="text-green-300">'job_123'</span>,</p>
                                <p className="pl-4 text-white">minScore: <span className="text-orange-300">0.85</span></p>
                                <p className="text-white">{`}`});</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 section">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="card p-8">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                            <Terminal className="w-6 h-6 text-[var(--primary-blue)]" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Resume Parser API</h3>
                        <p className="text-[var(--foreground-secondary)] mb-4">
                            Extract structured JSON data from PDFs and Word docs. Skills, experience, education—parsed in milliseconds.
                        </p>
                        <a href="#" className="text-[var(--primary-blue)] font-bold hover:underline">View Endpoint →</a>
                    </div>
                    <div className="card p-8">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                            <Terminal className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Matching Engine</h3>
                        <p className="text-[var(--foreground-secondary)] mb-4">
                            Send job requirements and candidate profiles, get back similarity scores and fit analysis generated by generic Gemini models.
                        </p>
                        <a href="#" className="text-[var(--primary-blue)] font-bold hover:underline">View Endpoint →</a>
                    </div>
                    <div className="card p-8">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                            <Terminal className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Webhooks</h3>
                        <p className="text-[var(--foreground-secondary)] mb-4">
                            Get real-time notifications for application updates, new matches, and pipeline status changes.
                        </p>
                        <a href="#" className="text-[var(--primary-blue)] font-bold hover:underline">View Endpoint →</a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
