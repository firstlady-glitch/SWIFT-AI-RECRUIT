import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get('published') === 'true';

    let query = supabase.from('jobs').select('*');

    if (publishedOnly) {
        query = query.eq('status', 'published');
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createServerSupabaseClient();
    const json = await request.json();

    const { data, error } = await supabase
        .from('jobs')
        .insert(json)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
