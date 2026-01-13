import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createNotification, sendEmailNotification } from '@/lib/notifications';

// GET: Fetch messages for a conversation
export async function GET(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
        return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    try {
        // Verify user is participant
        const { data: conv } = await supabase
            .from('conversations')
            .select('participant_ids')
            .eq('id', conversationId)
            .single();

        if (!conv || !conv.participant_ids.includes(user.id)) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('messages')
            .select('*, sender:profiles(id, full_name, profile_image_url)')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ messages: data });
    } catch (error: any) {
        console.error('[Messages] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Send a message
export async function POST(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { conversationId, content } = body;

        if (!conversationId || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify user is participant
        const { data: conv } = await supabase
            .from('conversations')
            .select('participant_ids')
            .eq('id', conversationId)
            .single();

        if (!conv || !conv.participant_ids.includes(user.id)) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        // Create message
        const { data: message, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content: content.trim(),
            })
            .select()
            .single();

        if (error) throw error;

        // Update conversation
        await supabase
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversationId);

        // Notify other participants
        const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

        const otherParticipants = conv.participant_ids.filter((id: string) => id !== user.id);

        for (const participantId of otherParticipants) {
            await createNotification({
                userId: participantId,
                type: 'message_received',
                title: 'New message',
                message: `${senderProfile?.full_name || 'Someone'} sent you a message`,
            });
        }

        console.log('[Messages] Sent message:', message.id);
        return NextResponse.json({ message });
    } catch (error: any) {
        console.error('[Messages] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Mark messages as read
export async function PATCH(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { conversationId } = body;

        if (!conversationId) {
            return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
        }

        // Mark all messages as read
        const { error } = await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .neq('sender_id', user.id)
            .is('read_at', null);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Messages] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
