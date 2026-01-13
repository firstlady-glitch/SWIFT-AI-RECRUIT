import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET: Fetch user's notifications
export async function GET(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unread') === 'true';

        let query = supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (unreadOnly) {
            query = query.is('read_at', null);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({
            notifications: data,
            unreadCount: (data || []).filter(n => !n.read_at).length,
        });
    } catch (error: any) {
        console.error('[Notifications] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Mark notifications as read
export async function PATCH(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { notificationId, markAll } = body;

        if (markAll) {
            await supabase
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('user_id', user.id)
                .is('read_at', null);
        } else if (notificationId) {
            await supabase
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('id', notificationId)
                .eq('user_id', user.id);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Notifications] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Delete a notification
export async function DELETE(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await supabase
            .from('notifications')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Notifications] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
