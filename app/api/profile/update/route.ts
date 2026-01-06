import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { job_title, experience_years, skills, onboarding_completed } = body;

        console.log('[Profile Update] Received update request:', { job_title, experience_years, skills: skills?.length, onboarding_completed });

        const supabase = await createServerSupabaseClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('[Profile Update] Auth error:', authError);
            return NextResponse.json(
                { error: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        // Update profile
        const updateData: Record<string, unknown> = {};

        if (job_title !== undefined) updateData.job_title = job_title;
        if (experience_years !== undefined) updateData.experience_years = experience_years;
        if (skills !== undefined) updateData.skills = skills;
        if (onboarding_completed !== undefined) updateData.onboarding_completed = onboarding_completed;

        const { data, error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)
            .select()
            .single();

        if (updateError) {
            console.error('[Profile Update] Update error:', updateError);
            return NextResponse.json(
                { error: updateError.message || 'Failed to update profile' },
                { status: 500 }
            );
        }

        console.log('[Profile Update] Successfully updated profile for user:', user.id);

        return NextResponse.json({
            success: true,
            profile: data
        });
    } catch (error: any) {
        console.error('[Profile Update] Unexpected error:', error);
        return NextResponse.json(
            { error: error.message || 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
