'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
    title?: string;
    message: string;
    errorCode?: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({
    title = 'Something went wrong',
    message,
    errorCode,
    onRetry,
    className = ''
}: ErrorStateProps) {
    // Structured console logging for debugging
    if (errorCode) {
        console.error(`[ErrorState] Code: ${errorCode} | Message: ${message}`);
    }

    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm mb-4 max-w-md">{message}</p>

            {errorCode && (
                <p className="text-xs text-gray-600 font-mono mb-4">
                    Error Code: {errorCode}
                </p>
            )}

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
            )}
        </div>
    );
}
