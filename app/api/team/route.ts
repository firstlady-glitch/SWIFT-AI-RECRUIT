import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET: Fetch team members
export async function GET() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single();

        if (!profile?.organization_id) {
            return NextResponse.json({ error: 'No organization' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('team_members')
            .select('*, profile:profiles(full_name, email, profile_image_url)')
            .eq('organization_id', profile.organization_id);

        if (error) throw error;

        return NextResponse.json({ members: data });
    } catch (error: any) {
        console.error('[Team] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Update team member role
export async function PATCH(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { memberId, role } = body;

        if (!memberId || !role) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Verify user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single();

        const { data: currentMember } = await supabase
            .from('team_members')
            .select('role')
            .eq('organization_id', profile?.organization_id)
            .eq('profile_id', user.id)
            .single();

        if (!currentMember || !['owner', 'admin'].includes(currentMember.role)) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const { error } = await supabase
            .from('team_members')
            .update({ role })
            .eq('id', memberId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Team] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Remove team member
export async function DELETE(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const memberId = searchParams.get('id');

        if (!memberId) {
            return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
        }

        // Verify user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single();

        const { data: currentMember } = await supabase
            .from('team_members')
            .select('role')
            .eq('organization_id', profile?.organization_id)
            .eq('profile_id', user.id)
            .single();

        if (!currentMember || !['owner', 'admin'].includes(currentMember.role)) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('id', memberId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Team] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
