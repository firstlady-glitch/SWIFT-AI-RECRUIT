'use client';

import { useState } from 'react';
import { User, Bell, Shield, Wallet, Save } from 'lucide-react';

export default function ApplicantSettings() {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
            <p className="text-[var(--foreground-secondary)] mb-8">Manage your profile and preferences.</p>

            <div className="grid md:grid-cols-4 gap-8">
                {/* Settings Sidebar */}
                <div className="bg-[#15171e] rounded-xl border border-gray-800 h-fit">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 p-4 border-b border-gray-800 transition-colors ${activeTab === 'profile' ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <User className="w-5 h-5" /> Profile Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center gap-3 p-4 border-b border-gray-800 transition-colors ${activeTab === 'notifications' ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <Bell className="w-5 h-5" /> Notifications
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 p-4 border-b border-gray-800 transition-colors ${activeTab === 'security' ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <Shield className="w-5 h-5" /> Login & Security
                    </button>
                    <button
                        onClick={() => setActiveTab('billing')}
                        className={`w-full flex items-center gap-3 p-4 transition-colors ${activeTab === 'billing' ? 'bg-[var(--primary-blue)]/10 text-[var(--primary-blue)]' : 'hover:bg-gray-800 text-gray-400'}`}
                    >
                        <Wallet className="w-5 h-5" /> Billing (Pro)
                    </button>
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div className="card p-6 border border-gray-800 bg-[#15171e]">
                                <h3 className="text-xl font-bold mb-4">Personal Information</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-400">Full Name</label>
                                        <input type="text" className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm" defaultValue="John Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-400">Headline</label>
                                        <input type="text" className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm" defaultValue="Senior React Developer" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2 text-gray-400">Bio</label>
                                        <textarea className="w-full h-32 bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm resize-none" defaultValue="Passionate developer building great user experiences..." />
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

                    {activeTab === 'notifications' && (
                        <div className="card p-6 border border-gray-800 bg-[#15171e]">
                            <h3 className="text-xl font-bold mb-4">Notification Preferences</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-[#0b0c0f]">
                                    <div>
                                        <div className="font-medium text-white">Application Status</div>
                                        <div className="text-sm text-gray-400">Get emails when your status changes</div>
                                    </div>
                                    <input type="checkbox" className="w-5 h-5 toggle-checkbox" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-[#0b0c0f]">
                                    <div>
                                        <div className="font-medium text-white">Job Recommendations</div>
                                        <div className="text-sm text-gray-400">Weekly AI curated job lists</div>
                                    </div>
                                    <input type="checkbox" className="w-5 h-5 toggle-checkbox" defaultChecked />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="card p-6 border border-gray-800 bg-[#15171e]">
                            <h3 className="text-xl font-bold mb-4">Security Settings</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-400">Email Address</label>
                                    <input type="email" className="w-full bg-[#0b0c0f] border border-gray-800 rounded-lg p-3 text-sm" defaultValue="john@example.com" disabled />
                                </div>
                                <button className="text-[var(--primary-blue)] hover:underline text-sm">Change Password</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="card p-6 border border-gray-800 bg-[#15171e] text-center py-12">
                            <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">No Active Subscription</h3>
                            <p className="text-gray-400 mb-6">Upgrade to Pro to unlock unlimited AI credits.</p>
                            <button className="btn btn-primary px-6 py-2">View Plans</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
