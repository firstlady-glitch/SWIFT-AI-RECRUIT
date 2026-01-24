'use client';

import { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Mail, Database, Key, Save, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface SiteSettings {
    payments_enabled: boolean;
    allow_registration: boolean;
    require_approval: boolean;
    email_notifications: boolean;
    maintenance_mode: boolean;
    maintenance_message: string;
}

export default function AdminSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Platform settings state
    const [settings, setSettings] = useState<SiteSettings>({
        payments_enabled: true,
        allow_registration: true,
        require_approval: false,
        email_notifications: true,
        maintenance_mode: false,
        maintenance_message: 'We are currently performing maintenance. Please check back soon.',
    });

    // Fetch current settings on mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/settings');
            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }
            const data = await response.json();
            setSettings({
                payments_enabled: data.payments_enabled ?? true,
                allow_registration: data.allow_registration ?? true,
                require_approval: data.require_approval ?? false,
                email_notifications: data.email_notifications ?? true,
                maintenance_mode: data.maintenance_mode ?? false,
                maintenance_message: data.maintenance_message ?? 'We are currently performing maintenance.',
            });
        } catch (err: any) {
            console.error('[Settings] Error fetching:', err);
            setError(err.message || 'Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);

        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save settings');
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            console.error('[Settings] Error saving:', err);
            setError(err.message || 'Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 animate-spin rounded-full border-2 border-[var(--primary-blue)] border-t-transparent" />
                    <p className="text-[var(--foreground-secondary)]">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Platform Settings</h1>
                    <p className="text-gray-400">Configure platform-wide settings</p>
                </div>
                <button
                    onClick={fetchSettings}
                    className="flex items-center gap-2 px-4 py-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-lg transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            <div className="grid gap-6">
                {/* Payment Settings */}
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5 text-green-500" /> Payment Configuration
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[var(--foreground)]">Accept Payments</p>
                                <p className="text-sm text-[var(--foreground-secondary)]">Enable Stripe payment processing</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.payments_enabled}
                                    onChange={(e) => setSettings({ ...settings, payments_enabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <p className="text-sm text-yellow-400">
                                {settings.payments_enabled
                                    ? '✓ Payments are enabled. Users can subscribe to paid plans.'
                                    : '⚠ Payments are disabled. "Pay Now" buttons will show a coming soon message.'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Settings */}
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-500" /> User Management
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[var(--foreground)]">Allow Registration</p>
                                <p className="text-sm text-[var(--foreground-secondary)]">Allow new users to register</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.allow_registration}
                                    onChange={(e) => setSettings({ ...settings, allow_registration: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[var(--foreground)]">Require Approval</p>
                                <p className="text-sm text-[var(--foreground-secondary)]">Manually approve employer/recruiter accounts</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.require_approval}
                                    onChange={(e) => setSettings({ ...settings, require_approval: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-blue-500" /> Notifications
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[var(--foreground)]">Email Notifications</p>
                                <p className="text-sm text-[var(--foreground-secondary)]">Send email notifications to users</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.email_notifications}
                                    onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Maintenance */}
                <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-orange-500" /> Maintenance
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[var(--foreground)]">Maintenance Mode</p>
                                <p className="text-sm text-[var(--foreground-secondary)]">Temporarily disable the platform for maintenance</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.maintenance_mode}
                                    onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                        </div>

                        {settings.maintenance_mode && (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-[var(--foreground-secondary)]">
                                    Maintenance Message
                                </label>
                                <textarea
                                    value={settings.maintenance_message}
                                    onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    rows={3}
                                    placeholder="Maintenance message to display to users..."
                                />
                            </div>
                        )}
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
