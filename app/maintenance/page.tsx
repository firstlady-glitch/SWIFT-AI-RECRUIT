'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Wrench, Clock, RefreshCw } from 'lucide-react';

export default function MaintenancePage() {
    const [message, setMessage] = useState('We are currently performing scheduled maintenance. Please check back soon.');
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        // Fetch maintenance message from settings
        const fetchMessage = async () => {
            try {
                const response = await fetch('/api/settings');
                if (response.ok) {
                    const data = await response.json();
                    if (data.maintenance_message) {
                        setMessage(data.maintenance_message);
                    }
                    // If maintenance mode is off, redirect to home
                    if (!data.maintenance_mode) {
                        window.location.href = '/';
                    }
                }
            } catch (e) {
                // Use default message
            }
        };

        fetchMessage();

        // Countdown timer for auto-refresh
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    window.location.reload();
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            <div className="max-w-lg w-full text-center">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Image
                        src="/icon.png"
                        alt="SwiftAI Recruit"
                        width={80}
                        height={80}
                        className="rounded-2xl"
                    />
                </div>

                {/* Icon Animation */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center animate-pulse">
                            <Wrench className="w-12 h-12 text-orange-500" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--foreground)]">
                    Under Maintenance
                </h1>

                {/* Message */}
                <p className="text-lg text-[var(--foreground-secondary)] mb-8 leading-relaxed">
                    {message}
                </p>

                {/* Info Card */}
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-center gap-2 text-[var(--foreground-secondary)] mb-4">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Auto-refreshing in {countdown}s</span>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="px-6 py-3 bg-[var(--primary-blue)] hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    >
                        Refresh Now
                    </button>
                </div>

                {/* Admin Link */}
                <p className="text-sm text-[var(--foreground-secondary)]">
                    Are you an administrator?{' '}
                    <Link href="/admin/login" className="text-[var(--primary-blue)] hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}