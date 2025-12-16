'use client';

import { useState } from 'react';
import { Briefcase, Bell, Zap, Save } from 'lucide-react';

export default function RecruiterSettings() {
    const [activeTab, setActiveTab] = useState('agency');

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Recruiter Settings</h1>
            <p className="text-[var(--foreground-secondary)] mb-8">Manage agency profile and integrations.</p>

            <div className="grid md:grid-cols-4 gap-8">
                {/* Settings Sidebar */}
                <div className="bg-[#15171e] rounded-xl border border-gray-800 h-fit">
                    <button
                        onClick={() => setActiveTab('agency')}
                        className={`w-full flex items-center gap-3 p-4 border-b border-gray-800 transition-colors ${activeTab === 'agency' ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <Briefcase className="w-5 h-5" /> Agency Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('integrations')}
                        className={`w-full flex items-center gap-3 p-4  transition-colors ${activeTab === 'integrations' ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <Zap className="w-5 h-5" /> Integrations
                    </button>
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    {activeTab === 'agency' && (
                        <div className="space-y-6">
                            <div className="card p-6 border border-gray-800 bg-[#15171e]">
                                <h3 className="text-xl font-bold mb-4">Agency Details</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-400">Agency Name</label>
                                        <input type="text" className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm" defaultValue="Elite Talent" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-400">Specialization</label>
                                        <input type="text" className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm" defaultValue="Tech & Startups" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2 text-gray-400">Public Description</label>
                                        <textarea className="w-full h-32 bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm resize-none" defaultValue="Top-tier recruiting for fast growing teams..." />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button className="btn btn-primary px-6 py-2 flex items-center gap-2">
                                    <Save className="w-4 h-4" /> Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        <div className="space-y-4">
                            <div className="card p-6 border border-gray-800 bg-[#15171e] flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">LinkedIn Recruiter</h3>
                                    <p className="text-sm text-gray-400">Connect to sync fast.</p>
                                </div>
                                <button className="btn btn-secondary text-xs">Connect</button>
                            </div>
                            <div className="card p-6 border border-gray-800 bg-[#15171e] flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">Gmail / Outlook</h3>
                                    <p className="text-sm text-gray-400">Sync emails for candidates.</p>
                                </div>
                                <button className="btn btn-secondary text-xs">Connect</button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
