'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChatInterface } from '@/components/messages/ChatInterface';
import { LoadingState } from '@/components/ui/LoadingState';

export default function ApplicantMessagesPage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--background)] p-8">
                <LoadingState type="list" count={1} />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="h-[calc(100vh-64px)] bg-[var(--background)] p-4 md:p-8 overflow-hidden">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Messages</h1>
                    <p className="text-gray-400">Manage your conversations with employers and recruiters.</p>
                </div>
                <div className="flex-1 min-h-0">
                    <ChatInterface currentUserId={user.id} />
                </div>
            </div>
        </div>
    );
}