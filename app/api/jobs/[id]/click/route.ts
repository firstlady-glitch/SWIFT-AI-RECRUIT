import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: jobId } = await params;

    try {
        const supabase = await createServerSupabaseClient();

        // Get current user if authenticated
        const { data: { user } } = await supabase.auth.getUser();

        // Get request metadata
        const userAgent = request.headers.get('user-agent') || null;
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ipAddress = forwardedFor?.split(',')[0] || null;

        // Record the click
        const { error } = await supabase
            .from('job_click_analytics')
            .insert({
                job_id: jobId,
                user_id: user?.id || null,
                user_agent: userAgent,
                ip_address: ipAddress
            });

        if (error) {
            console.error('[JobClick] Error recording click:', error);
            // Don't fail the request - click tracking is non-critical
        } else {
            console.log('[JobClick] Recorded click for job:', jobId);
        }

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error('[JobClick] Unexpected error:', err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
