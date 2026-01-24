'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export interface SiteSettings {
    payments_enabled: boolean;
    allow_registration: boolean;
    require_approval: boolean;
    email_notifications: boolean;
    maintenance_mode: boolean;
    maintenance_message: string;
}

const defaultSettings: SiteSettings = {
    payments_enabled: true,
    allow_registration: true,
    require_approval: false,
    email_notifications: true,
    maintenance_mode: false,
    maintenance_message: 'We are currently performing maintenance. Please check back soon.',
};

interface SiteSettingsContextType {
    settings: SiteSettings;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
    settings: defaultSettings,
    isLoading: true,
    error: null,
    refetch: async () => { },
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/settings');
            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }

            const data = await response.json();
            setSettings({
                payments_enabled: data.payments_enabled ?? defaultSettings.payments_enabled,
                allow_registration: data.allow_registration ?? defaultSettings.allow_registration,
                require_approval: data.require_approval ?? defaultSettings.require_approval,
                email_notifications: data.email_notifications ?? defaultSettings.email_notifications,
                maintenance_mode: data.maintenance_mode ?? defaultSettings.maintenance_mode,
                maintenance_message: data.maintenance_message ?? defaultSettings.maintenance_message,
            });
        } catch (err: any) {
            console.error('[SiteSettings] Error:', err);
            setError(err.message);
            // Keep default settings on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SiteSettingsContext.Provider value={{ settings, isLoading, error, refetch: fetchSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
}

export function useSiteSettings() {
    return useContext(SiteSettingsContext);
}

// Simple hook for direct fetch (for pages that don't use context)
export function useSettings() {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings');
                if (response.ok) {
                    const data = await response.json();
                    setSettings(data);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    return { settings, isLoading, error };
}
