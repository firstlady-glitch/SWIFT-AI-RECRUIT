import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('jobs')
        .select(`
            *,
            organization:organizations(name, logo_url)
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('[API/Jobs/ID] GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const body = await request.json();

    // Validate user owns this job
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    const { data: existingJob } = await supabase
        .from('jobs')
        .select('organization_id')
        .eq('id', id)
        .single();

    if (!existingJob || existingJob.organization_id !== profile?.organization_id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
        .from('jobs')
        .update({
            title: body.title,
            description: body.description,
            location: body.location,
            type: body.type,
            salary_range_min: body.salary_range_min,
            salary_range_max: body.salary_range_max,
            requirements: body.requirements,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('[API/Jobs/ID] PUT Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API/Jobs/ID] Updated job:', id);
    return NextResponse.json(data);
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const body = await request.json();

    // Validate user owns this job
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    const { data: existingJob } = await supabase
        .from('jobs')
        .select('organization_id')
        .eq('id', id)
        .single();

    if (!existingJob || existingJob.organization_id !== profile?.organization_id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // PATCH allows partial updates (e.g., just status)
    const { data, error } = await supabase
        .from('jobs')
        .update({
            ...body,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('[API/Jobs/ID] PATCH Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API/Jobs/ID] Patched job:', id, 'with:', Object.keys(body));
    return NextResponse.json(data);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Validate user owns this job
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

    const { data: existingJob } = await supabase
        .from('jobs')
        .select('organization_id, status')
        .eq('id', id)
        .single();

    if (!existingJob || existingJob.organization_id !== profile?.organization_id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only allow deletion of draft jobs
    if (existingJob.status !== 'draft') {
        return NextResponse.json(
            { error: 'Only draft jobs can be deleted. Archive or close the job instead.' },
            { status: 400 }
        );
    }

    const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('[API/Jobs/ID] DELETE Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API/Jobs/ID] Deleted job:', id);
    return NextResponse.json({ success: true });
}
