import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params are now a Promise in Next.js 15+ (if using latest, otherwise simple object)
    // To be safe for standard Next 14, stick to { params: { id: string } } but if strict, await it.
    // However, in App Router handlers, params is just an object.
) {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Get pipeline stats
    const { data, error } = await supabase
        .from('applications')
        .select('status')
        .eq('job_id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const stats = data.reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {});

    return NextResponse.json(stats);
}
