'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface AIToolLayoutProps {
    title: string;
    description: string;
    icon: ReactNode;
    iconBgColor: string;
    backHref: string;
    children: ReactNode;
    outputContent?: string;
    outputPlaceholder?: string;
    outputIcon?: ReactNode;
}

export function AIToolLayout({
    title,
    description,
    icon,
    iconBgColor,
    backHref,
    children,
    outputContent,
    outputPlaceholder = 'Generated content will appear here.',
    outputIcon
}: AIToolLayoutProps) {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = () => {
        if (outputContent) {
            navigator.clipboard.writeText(outputContent);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                <Link
                    href={backHref}
                    className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tools
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className={`p-3 ${iconBgColor} rounded-xl`}>
                        {icon}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-1">{title}</h1>
                        <p className="text-gray-400">{description}</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        {children}
                    </div>

                    {/* Output Section */}
                    <div className="relative">
                        <div className="h-full min-h-[500px] bg-[#15171e] border border-gray-800 rounded-xl p-8 relative">
                            {outputContent ? (
                                <>
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title="Copy to clipboard"
                                    >
                                        {isCopied ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                    <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                                        {outputContent}
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 opacity-50 p-6 text-center">
                                    {outputIcon || <Sparkles className="w-16 h-16 mb-4" />}
                                    <p className="text-lg">{outputPlaceholder}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reusable input card component
interface InputCardProps {
    label: string;
    children: ReactNode;
}

export function InputCard({ label, children }: InputCardProps) {
    return (
        <div className="card p-6 border border-gray-800 bg-[#15171e]">
            <label className="block text-sm font-medium mb-2 text-gray-300">
                {label}
            </label>
            {children}
        </div>
    );
}

// Reusable generate button
interface GenerateButtonProps {
    onClick: () => void;
    isLoading: boolean;
    disabled?: boolean;
    loadingText?: string;
    buttonText: string;
    icon?: ReactNode;
}

export function GenerateButton({
    onClick,
    isLoading,
    disabled = false,
    loadingText = 'Generating...',
    buttonText,
    icon
}: GenerateButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={isLoading || disabled}
            className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
        >
            {isLoading ? (
                <>
                    {loadingText}
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                </>
            ) : (
                <>
                    {buttonText}
                    {icon}
                </>
            )}
        </button>
    );
}
