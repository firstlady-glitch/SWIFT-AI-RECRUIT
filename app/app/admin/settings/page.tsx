'use client';

import { useState } from 'react';
import { Settings, Shield, Bell, Mail, Database, Key, Save, Check } from 'lucide-react';
import { ACCEPT_PAYMENTS } from '@/lib/stripe';

export default function AdminSettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Platform settings state
    const [settings, setSettings] = useState({
        paymentsEnabled: ACCEPT_PAYMENTS,
        emailNotifications: true,
        maintenanceMode: false,
        allowRegistration: true,
        requireApproval: false,
    });

    const handleSave = async () => {
        setIsSaving(true);
        // In production, save to database or config
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Platform Settings</h1>
                <p className="text-gray-400">Configure platform-wide settings</p>
            </div>

            <div className="grid gap-6">
                {/* Payment Settings */}
                <div className="bg-[#15171e] border border-gray-800 rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5 text-green-500" /> Payment Configuration
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white">Accept Payments</p>
                                <p className="text-sm text-gray-500">Enable Stripe payment processing</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.paymentsEnabled}
                                    onChange={(e) => setSettings({ ...settings, paymentsEnabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <p className="text-sm text-yellow-400">
                                {settings.paymentsEnabled
                                    ? '✓ Payments are enabled. Users can subscribe to paid plans.'
                                    : '⚠ Payments are disabled. "Pay Now" buttons will show a coming soon message.'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Settings */}
                <div className="bg-[#15171e] border border-gray-800 rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-500" /> User Management
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white">Allow Registration</p>
                                <p className="text-sm text-gray-500">Allow new users to register</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.allowRegistration}
                                    onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white">Require Approval</p>
                                <p className="text-sm text-gray-500">Manually approve employer/recruiter accounts</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.requireApproval}
                                    onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-[#15171e] border border-gray-800 rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-blue-500" /> Notifications
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white">Email Notifications</p>
                                <p className="text-sm text-gray-500">Send email notifications to users</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.emailNotifications}
                                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Maintenance */}
                <div className="bg-[#15171e] border border-gray-800 rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-orange-500" /> Maintenance
                    </h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white">Maintenance Mode</p>
                            <p className="text-sm text-gray-500">Temporarily disable the platform for maintenance</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.maintenanceMode}
                                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--primary-blue)] hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                    {saved ? (
                        <>
                            <Check className="w-5 h-5" /> Saved
                        </>
                    ) : isSaving ? (
                        <>
                            <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" /> Save Settings
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
