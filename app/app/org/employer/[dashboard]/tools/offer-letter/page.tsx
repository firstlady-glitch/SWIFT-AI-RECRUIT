'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Sparkles, Send, Copy, Check, FileText } from 'lucide-react';
import Link from 'next/link';

export default function OfferLetterTool() {
    const params = useParams();
    const [candidateName, setCandidateName] = useState('');
    const [role, setRole] = useState('');
    const [salary, setSalary] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = async () => {
        if (!candidateName || !role) return;

        setIsLoading(true);
        setGeneratedContent('');

        const prompt = `
            Write a formal employment offer letter.
            
            Candidate: ${candidateName}
            Role: ${role}
            Salary: ${salary}
            
            Include standard clauses for start date (placeholder), benefits summary, and at-will employment.
            Tone: Welcoming and professional.
        `;

        try {
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!res.ok) throw new Error('Generation failed');

            const data = await res.json();
            setGeneratedContent(data.result);
        } catch (error) {
            console.error(error);
            alert('Failed to generate offer letter.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                <Link
                    href={`/app/org/employer/${params.dashboard}/tools`}
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tools
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Offer Letter Generator</h1>
                        <p className="text-gray-400">Draft compliant and exciting offer letters.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="card p-6 border border-gray-800 bg-[#15171e]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">Candidate Name</label>
                            <input
                                type="text"
                                value={candidateName}
                                onChange={(e) => setCandidateName(e.target.value)}
                                className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                placeholder="Jane Doe"
                            />
                        </div>

                        <div className="card p-6 border border-gray-800 bg-[#15171e]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">Role Title</label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                placeholder="Marketing Manager"
                            />
                        </div>

                        <div className="card p-6 border border-gray-800 bg-[#15171e]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">Salary / Compensation</label>
                            <input
                                type="text"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                placeholder="$120,000/year"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !candidateName}
                            className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>Generatiing... <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /></>
                            ) : (
                                <>Generate Offer <Send className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>

                    <div className="relative">
                        <div className="h-full min-h-[500px] bg-[#15171e] border border-gray-800 rounded-xl p-8 relative">
                            {generatedContent ? (
                                <>
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title="Copy to clipboard"
                                    >
                                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                                        {generatedContent}
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 opacity-50 p-6 text-center">
                                    <FileText className="w-16 h-16 mb-4" />
                                    <p className="text-lg">Offer letter will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
