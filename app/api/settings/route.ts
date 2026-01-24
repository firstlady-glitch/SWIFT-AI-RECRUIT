import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export interface SiteSettings {
    id: string;
    payments_enabled: boolean;
    allow_registration: boolean;
    require_approval: boolean;
    email_notifications: boolean;
    maintenance_mode: boolean;
    maintenance_message: string;
    updated_at: string;
}

// Default settings to return when table doesn't exist or no data
const defaultSettings = {
    payments_enabled: true,
    allow_registration: true,
    require_approval: false,
    email_notifications: true,
    maintenance_mode: false,
    maintenance_message: 'We are currently performing maintenance. Please check back soon.',
};

// GET - Fetch current site settings
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .limit(1)
            .single();

        if (error) {
            // PGRST116 = no rows returned (empty table)
            // 42P01 = table doesn't exist
            // PGRST204 = no content
            console.log('[Settings API] Supabase error:', error.code, error.message);

            if (error.code === 'PGRST116' || error.code === '42P01' || error.code === 'PGRST204' || error.message?.includes('does not exist')) {
                console.log('[Settings API] Returning default settings');
                return NextResponse.json(defaultSettings);
            }
            throw error;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[Settings API] Error fetching:', error);
        // Always return defaults on error so the app doesn't break
        return NextResponse.json(defaultSettings);
    }
}

// PUT - Update site settings (admin only)
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();

        // Verify user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const body = await request.json();

        // Check if settings exist
        const { data: existingSettings } = await supabase
            .from('site_settings')
            .select('id')
            .limit(1)
            .single();

        let result;

        if (existingSettings) {
            // Update existing
            result = await supabase
                .from('site_settings')
                .update({
                    payments_enabled: body.payments_enabled,
                    allow_registration: body.allow_registration,
                    require_approval: body.require_approval,
                    email_notifications: body.email_notifications,
                    maintenance_mode: body.maintenance_mode,
                    maintenance_message: body.maintenance_message,
                })
                .eq('id', existingSettings.id)
                .select()
                .single();
        } else {
            // Insert new
            result = await supabase
                .from('site_settings')
                .insert({
                    payments_enabled: body.payments_enabled ?? true,
                    allow_registration: body.allow_registration ?? true,
                    require_approval: body.require_approval ?? false,
                    email_notifications: body.email_notifications ?? true,
                    maintenance_mode: body.maintenance_mode ?? false,
                    maintenance_message: body.maintenance_message ?? 'We are currently performing maintenance.',
                })
                .select()
                .single();
        }

        if (result.error) throw result.error;

        return NextResponse.json(result.data);
    } catch (error: any) {
        console.error('[Settings API] Error updating:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
