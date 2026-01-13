import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createNotification } from '@/lib/notifications';

// GET: Fetch submissions
export async function GET(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');
        const recruiterId = searchParams.get('recruiterId');

        let query = supabase
            .from('recruiter_submissions')
            .select(`
                *,
                recruiter:profiles!recruiter_submissions_recruiter_id_fkey(full_name),
                candidate:profiles!recruiter_submissions_candidate_id_fkey(full_name, job_title, skills),
                job:jobs(title, organization:organizations(name))
            `)
            .order('created_at', { ascending: false });

        if (jobId) query = query.eq('job_id', jobId);
        if (recruiterId) query = query.eq('recruiter_id', recruiterId);

        const { data, error } = await query;
        if (error) throw error;

        // Transform nested data
        const transformed = (data || []).map(s => ({
            ...s,
            recruiter: Array.isArray(s.recruiter) ? s.recruiter[0] : s.recruiter,
            candidate: Array.isArray(s.candidate) ? s.candidate[0] : s.candidate,
            job: Array.isArray(s.job) ? s.job[0] : s.job,
        }));

        return NextResponse.json({ submissions: transformed });
    } catch (error: any) {
        console.error('[Submissions] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create submission
export async function POST(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { jobId, candidateId, notes } = body;

        if (!jobId || !candidateId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if already submitted
        const { data: existing } = await supabase
            .from('recruiter_submissions')
            .select('id')
            .eq('recruiter_id', user.id)
            .eq('job_id', jobId)
            .eq('candidate_id', candidateId)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Candidate already submitted' }, { status: 400 });
        }

        // Create submission
        const { data, error } = await supabase
            .from('recruiter_submissions')
            .insert({
                recruiter_id: user.id,
                job_id: jobId,
                candidate_id: candidateId,
                notes: notes || null,
                status: 'pending',
            })
            .select()
            .single();

        if (error) throw error;

        // Notify employer
        const { data: job } = await supabase
            .from('jobs')
            .select('title, posted_by')
            .eq('id', jobId)
            .single();

        if (job?.posted_by) {
            await createNotification({
                userId: job.posted_by,
                type: 'application_received',
                title: 'New candidate submission',
                message: `A recruiter submitted a candidate for ${job.title}`,
                link: `/app/org/employer/jobs/${jobId}`,
            });
        }

        console.log('[Submissions] Created:', data.id);
        return NextResponse.json({ submission: data });
    } catch (error: any) {
        console.error('[Submissions] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Update submission status
export async function PATCH(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { submissionId, status, commissionAmount } = body;

        if (!submissionId || !status) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = { status };
        if (commissionAmount !== undefined) {
            updateData.commission_amount = commissionAmount;
        }

        const { error } = await supabase
            .from('recruiter_submissions')
            .update(updateData)
            .eq('id', submissionId);

        if (error) throw error;

        // Notify recruiter of status change
        const { data: submission } = await supabase
            .from('recruiter_submissions')
            .select('recruiter_id, job:jobs(title)')
            .eq('id', submissionId)
            .single();

        if (submission) {
            const job = Array.isArray(submission.job) ? submission.job[0] : submission.job;
            await createNotification({
                userId: submission.recruiter_id,
                type: 'application_status_changed',
                title: `Submission ${status}`,
                message: `Your candidate submission for ${job?.title} was ${status}`,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Submissions] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
