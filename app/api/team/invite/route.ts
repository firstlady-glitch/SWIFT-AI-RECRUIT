import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendEmailNotification } from '@/lib/notifications';
import { randomBytes } from 'crypto';

// POST: Send team invite
export async function POST(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { email, role = 'member' } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // Get current user's organization
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single();

        if (!profile?.organization_id) {
            return NextResponse.json({ error: 'No organization found' }, { status: 400 });
        }

        // Check if user is admin
        const { data: currentMember } = await supabase
            .from('team_members')
            .select('role')
            .eq('organization_id', profile.organization_id)
            .eq('profile_id', user.id)
            .single();

        if (!currentMember || !['owner', 'admin'].includes(currentMember.role)) {
            return NextResponse.json({ error: 'Not authorized to invite' }, { status: 403 });
        }

        // Check if already invited
        const { data: existing } = await supabase
            .from('team_members')
            .select('id')
            .eq('organization_id', profile.organization_id)
            .eq('invite_email', email)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'User already invited' }, { status: 400 });
        }

        // Check if user exists in system
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        // Generate invite token
        const inviteToken = randomBytes(32).toString('hex');

        // Create team member entry
        const { data: teamMember, error } = await supabase
            .from('team_members')
            .insert({
                organization_id: profile.organization_id,
                profile_id: existingProfile?.id || null,
                role,
                invited_by: user.id,
                invite_email: email,
                invite_token: inviteToken,
                accepted_at: existingProfile ? new Date().toISOString() : null,
            })
            .select()
            .single();

        if (error) throw error;

        // Get organization name
        const { data: org } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', profile.organization_id)
            .single();

        // Send invite email
        const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteToken}`;
        await sendEmailNotification({
            to: email,
            subject: `You've been invited to join ${org?.name || 'a team'} on SwiftAI Recruit`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Team Invitation</h2>
                    <p>You've been invited to join <strong>${org?.name || 'a team'}</strong> on SwiftAI Recruit as a <strong>${role}</strong>.</p>
                    <a href="${inviteUrl}" style="display: inline-block; background: #0066ff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0;">
                        Accept Invitation
                    </a>
                    <p style="color: #666; font-size: 12px;">If you don't have an account, you'll be prompted to create one.</p>
                </div>
            `,
        });

        console.log('[TeamInvite] Sent invite to:', email);
        return NextResponse.json({ success: true, teamMember });
    } catch (error: any) {
        console.error('[TeamInvite] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
