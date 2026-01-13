import { NextRequest, NextResponse } from 'next/server';
import { createPortalSession, stripe, ACCEPT_PAYMENTS } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    console.log('[Stripe/Portal] Creating portal session');

    if (!ACCEPT_PAYMENTS || !stripe) {
        return NextResponse.json(
            { error: 'Payments not enabled.' },
            { status: 400 }
        );
    }

    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated.' },
                { status: 401 }
            );
        }

        // Get Stripe customer ID
        const { data: stripeCustomer } = await supabase
            .from('stripe_customers')
            .select('stripe_customer_id')
            .eq('profile_id', user.id)
            .single();

        if (!stripeCustomer?.stripe_customer_id) {
            return NextResponse.json(
                { error: 'No subscription found. Subscribe to a plan first.' },
                { status: 400 }
            );
        }

        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const returnUrl = `${origin}/app/settings`;

        const session = await createPortalSession({
            customerId: stripeCustomer.stripe_customer_id,
            returnUrl,
        });

        if (!session) {
            throw new Error('Failed to create portal session');
        }

        console.log('[Stripe/Portal] Session created');

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('[Stripe/Portal] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create portal session.' },
            { status: 500 }
        );
    }
}
