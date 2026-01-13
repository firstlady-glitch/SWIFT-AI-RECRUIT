import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET: Fetch user's conversations
export async function GET() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .contains('participant_ids', [user.id])
            .order('last_message_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ conversations: data });
    } catch (error: any) {
        console.error('[Conversations] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create new conversation
export async function POST(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { recipientId, jobId } = body;

        if (!recipientId) {
            return NextResponse.json({ error: 'Recipient ID required' }, { status: 400 });
        }

        // Check if conversation already exists
        const { data: existing } = await supabase
            .from('conversations')
            .select('*')
            .contains('participant_ids', [user.id, recipientId])
            .single();

        if (existing) {
            return NextResponse.json({ conversation: existing });
        }

        // Create new conversation
        const { data, error } = await supabase
            .from('conversations')
            .insert({
                participant_ids: [user.id, recipientId],
                job_id: jobId || null,
            })
            .select()
            .single();

        if (error) throw error;

        console.log('[Conversations] Created:', data.id);
        return NextResponse.json({ conversation: data });
    } catch (error: any) {
        console.error('[Conversations] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
