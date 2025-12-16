'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Sparkles, Send, Copy, Check, Search } from 'lucide-react';
import Link from 'next/link';

export default function BooleanSearchTool() {
    const params = useParams();
    const [role, setRole] = useState('');
    const [requirements, setRequirements] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = async () => {
        if (!role) return;

        setIsLoading(true);
        setGeneratedContent('');

        const prompt = `
            Generate precise Boolean Search Strings (x-ray search) for LinkedIn and Google to find candidates.
            
            Target Role: ${role}
            Must Have Requirements: ${requirements}
            
            Output 3 string variations:
            1. Broad Search (Captures many).
            2. Specific Search (High relevance).
            3. "Hidden Gem" Search (Alternative titles/keywords).
            
            Format as code blocks for easy copying.
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
            alert('Failed to generate search strings.');
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
                    href={`/app/org/recruiter/${params.dashboard}/tools`}
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tools
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                        <Search className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Boolean Search Generator</h1>
                        <p className="text-gray-400">Master sourcing with perfect search strings.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="card p-6 border border-gray-800 bg-[#15171e]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">Target Role</label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                placeholder="e.g. Java Architect"
                            />
                        </div>

                        <div className="card p-6 border border-gray-800 bg-[#15171e]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">Must Have Keywords</label>
                            <textarea
                                value={requirements}
                                onChange={(e) => setRequirements(e.target.value)}
                                className="w-full h-40 bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none resize-none"
                                placeholder="e.g. Spring Boot, Microservices, 10+ years, Finance industry"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !role}
                            className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>Generatiing... <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /></>
                            ) : (
                                <>Generate Strings <Send className="w-4 h-4" /></>
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
                                    <Search className="w-16 h-16 mb-4" />
                                    <p className="text-lg">Search strings will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
