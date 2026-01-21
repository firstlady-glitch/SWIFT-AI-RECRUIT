interface LoadingStateProps {
    type?: 'card' | 'table' | 'list' | 'stats';
    count?: number;
    className?: string;
}

export function LoadingState({ type = 'card', count = 3, className = '' }: LoadingStateProps) {
    if (type === 'stats') {
        return (
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 animate-pulse">
                        <div className="h-4 w-20 bg-[var(--border)] rounded mb-3" />
                        <div className="h-8 w-16 bg-[var(--border)] rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'table') {
        return (
            <div className={`bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl overflow-hidden ${className}`}>
                <div className="border-b border-[var(--border)] p-4">
                    <div className="flex gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-4 bg-[var(--border)] rounded flex-1 animate-pulse" />
                        ))}
                    </div>
                </div>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="border-b border-[var(--border)]/50 p-4">
                        <div className="flex gap-4">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <div key={j} className="h-4 bg-[var(--border)] rounded flex-1 animate-pulse" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div className={`space-y-3 ${className}`}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-4 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[var(--border)] rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/3 bg-[var(--border)] rounded" />
                                <div className="h-3 w-1/2 bg-[var(--border)] rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Card type (default)
    return (
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 animate-pulse">
                    <div className="h-5 w-3/4 bg-[var(--border)] rounded mb-3" />
                    <div className="h-4 w-1/2 bg-[var(--border)] rounded mb-4" />
                    <div className="space-y-2">
                        <div className="h-3 w-full bg-[var(--border)] rounded" />
                        <div className="h-3 w-5/6 bg-[var(--border)] rounded" />
                    </div>
                    <div className="mt-4 flex gap-2">
                        <div className="h-6 w-16 bg-[var(--border)] rounded-full" />
                        <div className="h-6 w-16 bg-[var(--border)] rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Full page loading state
export function PageLoading() {
    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--primary-blue)] border-t-transparent" />
                <p className="text-gray-400">Loading...</p>
            </div>
        </div>
    );
}
