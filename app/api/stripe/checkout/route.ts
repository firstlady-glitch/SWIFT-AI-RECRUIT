import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, SUBSCRIPTION_PLANS, ACCEPT_PAYMENTS, stripe, type PlanKey } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    console.log('[Stripe/Checkout] Creating checkout session');

    const body = await request.json();
    const { planKey, interval = 'monthly', role = 'applicant' } = body as {
        planKey: string;
        interval: 'monthly' | 'annual';
        role: string;
    };

    // Check if payments are enabled
    if (!ACCEPT_PAYMENTS || !stripe) {
        console.log('[Stripe/Checkout] Payments not enabled, redirecting to register');
        return NextResponse.json({
            redirect: true,
            url: `/auth/register?role=${role}&plan=${planKey}`,
            message: 'Payments are not currently enabled. Please sign up first.'
        });
    }

    // Get current user
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.log('[Stripe/Checkout] User not logged in, redirecting to register');
        return NextResponse.json({
            redirect: true,
            url: `/auth/register?role=${role}&plan=${planKey}`,
            message: 'Please sign up or log in first.'
        });
    }

    try {
        // Validate plan
        const plan = SUBSCRIPTION_PLANS[planKey as PlanKey];
        if (!plan) {
            return NextResponse.json(
                { error: 'Invalid plan selected.' },
                { status: 400 }
            );
        }

        // Get price ID based on interval
        const priceId = interval === 'annual'
            ? plan.stripePriceIdAnnual
            : plan.stripePriceIdMonthly;

        if (!priceId) {
            return NextResponse.json(
                { error: 'This plan does not support subscriptions.' },
                { status: 400 }
            );
        }

        // Get or create Stripe customer
        const { data: stripeCustomer } = await supabase
            .from('stripe_customers')
            .select('stripe_customer_id')
            .eq('profile_id', user.id)
            .single();

        let customerId = stripeCustomer?.stripe_customer_id;

        // If no customer exists, create one
        if (!customerId) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('email, full_name')
                .eq('id', user.id)
                .single();

            const customer = await stripe.customers.create({
                email: profile?.email || user.email,
                name: profile?.full_name || undefined,
                metadata: {
                    supabase_user_id: user.id,
                },
            });

            customerId = customer.id;

            // Save customer mapping
            await supabase.from('stripe_customers').insert({
                profile_id: user.id,
                stripe_customer_id: customerId,
            });

            console.log('[Stripe/Checkout] Created new customer:', customerId);
        }

        // Determine return URLs
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const successUrl = `${origin}/app?payment=success&plan=${planKey}`;
        const cancelUrl = `${origin}/pricing?payment=cancelled`;

        // Create checkout session
        const session = await createCheckoutSession({
            priceId,
            customerId,
            successUrl,
            cancelUrl,
            metadata: {
                user_id: user.id,
                plan_key: planKey,
                interval,
            },
        });

        if (!session) {
            throw new Error('Failed to create checkout session');
        }

        console.log('[Stripe/Checkout] Session created:', session.id);

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
        });
    } catch (error: any) {
        console.error('[Stripe/Checkout] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session.' },
            { status: 500 }
        );
    }
}
