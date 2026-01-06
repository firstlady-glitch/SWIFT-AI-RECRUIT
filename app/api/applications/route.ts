import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = supabase.from('applications').select('*');

    // Simple filter if provided
    if (userId) {
        query = query.eq('applicant_id', userId);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createServerSupabaseClient();
    const json = await request.json();

    const { data, error } = await supabase
        .from('applications')
        .insert(json)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
