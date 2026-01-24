'use client';

import { useState } from 'react';
import { Search, Users, Briefcase, UserPlus, Filter, Mail } from 'lucide-react';

// Employer Sourcing Page - Source recruiters and job seekers for gigs/contracts

export default function EmployerSourcingPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'recruiters' | 'candidates'>('recruiters');

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[var(--foreground)]">Talent Sourcing</h1>
                <p className="text-[var(--foreground-secondary)]">
                    Source recruiters and job seekers for gigs or contracts
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-[var(--border)]">
                <button
                    onClick={() => setActiveTab('recruiters')}
                    className={`px-4 py-3 font-medium transition-colors ${activeTab === 'recruiters'
                            ? 'text-[var(--primary-blue)] border-b-2 border-[var(--primary-blue)]'
                            : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Recruiters
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('candidates')}
                    className={`px-4 py-3 font-medium transition-colors ${activeTab === 'candidates'
                            ? 'text-[var(--primary-blue)] border-b-2 border-[var(--primary-blue)]'
                            : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Candidates
                    </div>
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-secondary)]" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-3 border border-[var(--border)] rounded-lg hover:bg-[var(--background-secondary)] transition-colors">
                    <Filter className="w-4 h-4" />
                    Filters
                </button>
            </div>

            {/* Coming Soon State */}
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-6 bg-[var(--background-secondary)] rounded-full mb-6">
                    <UserPlus className="w-12 h-12 text-[var(--primary-blue)]" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-[var(--foreground)]">
                    Sourcing Coming Soon
                </h2>
                <p className="text-[var(--foreground-secondary)] max-w-md mb-6">
                    {activeTab === 'recruiters'
                        ? 'Soon you\'ll be able to source and connect with professional recruiters for your hiring needs.'
                        : 'Soon you\'ll be able to source talented candidates directly and offer them gigs or contracts.'
                    }
                </p>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-[var(--primary-blue)] text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                        <Mail className="w-4 h-4" />
                        Get Notified
                    </button>
                </div>
            </div>
        </div>
    );
}