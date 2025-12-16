'use client';

import { useState } from 'react';
import { Building2, Bell, Users, CreditCard, Save } from 'lucide-react';

export default function EmployerSettings() {
    const [activeTab, setActiveTab] = useState('company');

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Company Settings</h1>
            <p className="text-[var(--foreground-secondary)] mb-8">Manage company profile and hiring team.</p>

            <div className="grid md:grid-cols-4 gap-8">
                {/* Settings Sidebar */}
                <div className="bg-[#15171e] rounded-xl border border-gray-800 h-fit">
                    <button
                        onClick={() => setActiveTab('company')}
                        className={`w-full flex items-center gap-3 p-4 border-b border-gray-800 transition-colors ${activeTab === 'company' ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <Building2 className="w-5 h-5" /> Company Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`w-full flex items-center gap-3 p-4 border-b border-gray-800 transition-colors ${activeTab === 'team' ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <Users className="w-5 h-5" /> Team Members
                    </button>
                    <button
                        onClick={() => setActiveTab('billing')}
                        className={`w-full flex items-center gap-3 p-4 transition-colors ${activeTab === 'billing' ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <CreditCard className="w-5 h-5" /> Subscription
                    </button>
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    {activeTab === 'company' && (
                        <div className="space-y-6">
                            <div className="card p-6 border border-gray-800 bg-[#15171e]">
                                <h3 className="text-xl font-bold mb-4">Company Details</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-400">Company Name</label>
                                        <input type="text" className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm" defaultValue="Acme Corp" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-400">Website</label>
                                        <input type="text" className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm" defaultValue="https://acme.com" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2 text-gray-400">Description</label>
                                        <textarea className="w-full h-32 bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm resize-none" defaultValue="Leading provider of awesome solutions..." />
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

                    {activeTab === 'team' && (
                        <div className="card p-6 border border-gray-800 bg-[#15171e]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Team Members</h3>
                                <button className="btn btn-secondary text-xs px-3 py-1">Invite Member</button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-[#0b0c0f]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold">JD</div>
                                        <div>
                                            <div className="font-medium text-white">Jane Doe</div>
                                            <div className="text-sm text-gray-400">jane@acme.com</div>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">Admin</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
