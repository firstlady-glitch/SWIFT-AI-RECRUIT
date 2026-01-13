import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notifyInterviewScheduled } from '@/lib/notifications';

// GET: Fetch interviews
export async function GET(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const applicationId = searchParams.get('applicationId');

        let query = supabase
            .from('interviews')
            .select(`
                *,
                application:applications(
                    id,
                    applicant:profiles(id, full_name, email),
                    job:jobs(id, title)
                ),
                organizer:profiles!interviews_organizer_id_fkey(full_name),
                interviewer:profiles!interviews_interviewer_id_fkey(full_name)
            `)
            .order('scheduled_at', { ascending: true });

        if (applicationId) {
            query = query.eq('application_id', applicationId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ interviews: data });
    } catch (error: any) {
        console.error('[Interviews] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Schedule new interview
export async function POST(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            applicationId,
            scheduledAt,
            durationMinutes = 60,
            meetingLink,
            location,
            interviewerId,
        } = body;

        if (!applicationId || !scheduledAt) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get current interview count for ordering
        const { count } = await supabase
            .from('interviews')
            .select('*', { count: 'exact', head: true })
            .eq('application_id', applicationId);

        const orderIndex = (count || 0) + 1;

        // Create interview
        const { data: interview, error } = await supabase
            .from('interviews')
            .insert({
                application_id: applicationId,
                organizer_id: user.id,
                interviewer_id: interviewerId || null,
                scheduled_at: scheduledAt,
                duration_minutes: durationMinutes,
                meeting_link: meetingLink || null,
                location: location || null,
                order_index: orderIndex,
                status: 'scheduled',
            })
            .select()
            .single();

        if (error) throw error;

        // Update application status to interview
        await supabase
            .from('applications')
            .update({ status: 'interview' })
            .eq('id', applicationId);

        // Notify applicant
        const { data: application } = await supabase
            .from('applications')
            .select(`
                applicant:profiles(id, email, full_name),
                job:jobs(title, organization:organizations(name))
            `)
            .eq('id', applicationId)
            .single();

        if (application?.applicant) {
            const applicant = Array.isArray(application.applicant) ? application.applicant[0] : application.applicant;
            const job = Array.isArray(application.job) ? application.job[0] : application.job;
            const org = (job as { organization?: { name?: string } | { name?: string }[] })?.organization;
            const orgName = Array.isArray(org) ? org[0]?.name : (org as { name?: string })?.name;

            await notifyInterviewScheduled({
                applicantId: applicant.id,
                applicantEmail: applicant.email || '',
                applicantName: applicant.full_name || 'Applicant',
                jobTitle: job?.title || 'Position',
                companyName: orgName || 'Company',
                scheduledAt,
                meetingLink,
            });
        }

        console.log('[Interviews] Scheduled:', interview.id);
        return NextResponse.json({ interview });
    } catch (error: any) {
        console.error('[Interviews] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
