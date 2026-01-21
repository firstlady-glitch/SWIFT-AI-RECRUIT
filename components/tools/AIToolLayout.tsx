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
                    className="inline-flex items-center text-[var(--foreground-secondary)] hover:text-[var(--foreground)] mb-6 transition-colors"
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
                        <p className="text-[var(--foreground-secondary)]">{description}</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        {children}
                    </div>

                    {/* Output Section */}
                    <div className="relative">
                        <div className="h-full min-h-[500px] bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-8 relative">
                            {outputContent ? (
                                <>
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute top-4 right-4 p-2 bg-[var(--border)] hover:bg-[var(--border)]/80 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
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
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--foreground-secondary)] opacity-50 p-6 text-center">
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
        <div className="card p-6 border border-[var(--border)] bg-[var(--background-secondary)]">
            <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
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
