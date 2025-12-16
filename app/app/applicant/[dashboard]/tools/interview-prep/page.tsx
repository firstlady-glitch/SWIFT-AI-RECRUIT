'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Sparkles, Send, Copy, Check, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function InterviewPrepTool() {
    const params = useParams();
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = async () => {
        if (!jobTitle) return;

        setIsLoading(true);
        setGeneratedContent('');

        const prompt = `
            You are a tough interviewer for a top tech company.
            Generate a list of interview questions for the role: ${jobTitle}.
            
            CONTEXT:
            ${jobDescription}

            Please provide:
            1. 3 General Behavioral Questions.
            2. 3 Technical/Role-Specific Questions (hard).
            3. 2 Situational Questions.
            
            For each question, provide a short "Hint" on what a great answer should include.
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
            alert('Failed to generate questions. Please try again.');
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
                    href={`/app/applicant/${params.dashboard}/tools`}
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tools
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-pink-500/10 rounded-xl text-pink-500">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Interview Prep AI</h1>
                        <p className="text-gray-400">Practice with custom generated interview questions.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        <div className="card p-6 border border-gray-800 bg-[#15171e]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">Role Title</label>
                            <input
                                type="text"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none"
                                placeholder="e.g. Senior Frontend Engineer"
                            />
                        </div>

                        <div className="card p-6 border border-gray-800 bg-[#15171e]">
                            <label className="block text-sm font-medium mb-2 text-gray-300">Job Description (Optional)</label>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="w-full h-40 bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm focus:border-[var(--primary-blue)] focus:outline-none resize-none"
                                placeholder="Paste job description for context..."
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !jobTitle}
                            className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>Generating... <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /></>
                            ) : (
                                <>Generate Questions <Send className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>

                    {/* Output Section */}
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
                                    <MessageSquare className="w-16 h-16 mb-4" />
                                    <p className="text-lg">Your interview questions will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
