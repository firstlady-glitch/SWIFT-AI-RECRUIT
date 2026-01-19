'use client';

import { LucideIcon, Inbox } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    className = ''
}: EmptyStateProps) {
    // Structured console logging for debugging
    console.log(`[EmptyState] Rendering: ${title}`);

    const ActionButton = () => {
        if (!actionLabel) return null;

        const buttonClasses = "mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary-blue)] hover:bg-blue-600 rounded-lg text-sm text-white font-medium transition-colors";

        if (actionHref) {
            return (
                <Link href={actionHref} className={buttonClasses}>
                    {actionLabel}
                </Link>
            );
        }

        if (onAction) {
            return (
                <button onClick={onAction} className={buttonClasses}>
                    {actionLabel}
                </button>
            );
        }

        return null;
    };

    return (
        <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
            <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-gray-500" />
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>

            {description && (
                <p className="text-gray-400 text-sm max-w-md">{description}</p>
            )}

            <ActionButton />
        </div>
    );
}
