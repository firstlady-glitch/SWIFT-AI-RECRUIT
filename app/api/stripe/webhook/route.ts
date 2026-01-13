import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, stripe, ACCEPT_PAYMENTS } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Use service role client for webhook (no user context)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
);

export async function POST(request: NextRequest) {
    console.log('[Stripe/Webhook] Received webhook');

    if (!ACCEPT_PAYMENTS || !stripe) {
        return NextResponse.json({ received: true });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        console.error('[Stripe/Webhook] No signature provided');
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const event = constructWebhookEvent(body, signature);
    if (!event) {
        console.error('[Stripe/Webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('[Stripe/Webhook] Event type:', event.type);

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutComplete(session);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdate(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionCancelled(subscription);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentSucceeded(invoice);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentFailed(invoice);
                break;
            }

            default:
                console.log('[Stripe/Webhook] Unhandled event type:', event.type);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('[Stripe/Webhook] Error processing event:', error);
        return NextResponse.json(
            { error: error.message || 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
    console.log('[Stripe/Webhook] Checkout completed:', session.id);

    const userId = session.metadata?.user_id;
    const planKey = session.metadata?.plan_key;

    if (!userId || !planKey) {
        console.error('[Stripe/Webhook] Missing metadata');
        return;
    }

    // Update user's plan
    const { error } = await supabaseAdmin
        .from('profiles')
        .update({ plan: planKey })
        .eq('id', userId);

    if (error) {
        console.error('[Stripe/Webhook] Error updating profile:', error);
        return;
    }

    // Create billing record
    await supabaseAdmin.from('billings').insert({
        profile_id: userId,
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        status: 'succeeded',
        plan_type: planKey,
        interval: session.metadata?.interval || 'monthly',
    });

    // Create notification
    await supabaseAdmin.from('notifications').insert({
        user_id: userId,
        type: 'payment_succeeded',
        title: 'Payment Successful',
        message: `You've successfully subscribed to the ${planKey} plan.`,
        link: '/app/settings',
    });

    console.log('[Stripe/Webhook] User upgraded to:', planKey);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    console.log('[Stripe/Webhook] Subscription updated:', subscription.id);

    // Get customer to find user
    const customerId = subscription.customer as string;
    const { data: stripeCustomer } = await supabaseAdmin
        .from('stripe_customers')
        .select('profile_id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (!stripeCustomer) {
        console.error('[Stripe/Webhook] Customer not found');
        return;
    }

    // Check subscription status
    if (subscription.status === 'active') {
        console.log('[Stripe/Webhook] Subscription is active');
    } else if (subscription.status === 'past_due') {
        // Notify user of payment issue
        await supabaseAdmin.from('notifications').insert({
            user_id: stripeCustomer.profile_id,
            type: 'payment_failed',
            title: 'Payment Issue',
            message: 'Your recent payment failed. Please update your payment method.',
            link: '/app/settings/billing',
        });
    }
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
    console.log('[Stripe/Webhook] Subscription cancelled:', subscription.id);

    const customerId = subscription.customer as string;
    const { data: stripeCustomer } = await supabaseAdmin
        .from('stripe_customers')
        .select('profile_id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (!stripeCustomer) return;

    // Downgrade user to free plan
    await supabaseAdmin
        .from('profiles')
        .update({ plan: 'free' })
        .eq('id', stripeCustomer.profile_id);

    // Notify user
    await supabaseAdmin.from('notifications').insert({
        user_id: stripeCustomer.profile_id,
        type: 'payment_failed',
        title: 'Subscription Cancelled',
        message: 'Your subscription has been cancelled. You\'ve been moved to the free plan.',
        link: '/pricing',
    });

    console.log('[Stripe/Webhook] User downgraded to free');
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log('[Stripe/Webhook] Payment succeeded:', invoice.id);

    const customerId = invoice.customer as string;
    const { data: stripeCustomer } = await supabaseAdmin
        .from('stripe_customers')
        .select('profile_id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (!stripeCustomer) return;

    // Record billing
    await supabaseAdmin.from('billings').insert({
        profile_id: stripeCustomer.profile_id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        invoice_url: invoice.hosted_invoice_url,
        payment_method_brand: (invoice as any).charge?.payment_method_details?.card?.brand || null,
        payment_method_last4: (invoice as any).charge?.payment_method_details?.card?.last4 || null,
        billing_period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
        billing_period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
    });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    console.log('[Stripe/Webhook] Payment failed:', invoice.id);

    const customerId = invoice.customer as string;
    const { data: stripeCustomer } = await supabaseAdmin
        .from('stripe_customers')
        .select('profile_id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (!stripeCustomer) return;

    // Record failed billing
    await supabaseAdmin.from('billings').insert({
        profile_id: stripeCustomer.profile_id,
        amount: invoice.amount_due,
        currency: invoice.currency,
        status: 'failed',
    });

    // Notify user
    await supabaseAdmin.from('notifications').insert({
        user_id: stripeCustomer.profile_id,
        type: 'payment_failed',
        title: 'Payment Failed',
        message: 'Your recent payment failed. Please update your payment method to avoid service interruption.',
        link: '/app/settings/billing',
    });
}
