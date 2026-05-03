import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key, { auth: { persistSession: false } });
}

export type FulfillInput = {
    reference: string;
    userId: string;
    profilePlan: string;
    interval: string;
    amountKobo: number;
    currency: string;
    paystackCustomerCode?: string | null;
};

export async function fulfillPaystackPayment(input: FulfillInput): Promise<boolean> {
    const supabase = supabaseAdmin();

    const { error: profileErr } = await supabase
        .from('profiles')
        .update({ plan: input.profilePlan, updated_at: new Date().toISOString() })
        .eq('id', input.userId);

    if (profileErr) {
        console.error('[Paystack/fulfill] profile update', profileErr);
        return false;
    }

    const customerKey = input.paystackCustomerCode
        ? `paystack_${input.paystackCustomerCode}`
        : `paystack_ref_${input.reference}`;

    const { data: existing } = await supabase
        .from('stripe_customers')
        .select('id')
        .eq('profile_id', input.userId)
        .maybeSingle();

    if (existing?.id) {
        await supabase
            .from('stripe_customers')
            .update({ stripe_customer_id: customerKey })
            .eq('profile_id', input.userId);
    } else {
        await supabase.from('stripe_customers').insert({
            profile_id: input.userId,
            stripe_customer_id: customerKey,
        });
    }

    try {
        await supabase.from('billings').insert({
            profile_id: input.userId,
            amount: input.amountKobo,
            currency: input.currency?.toLowerCase() || 'ngn',
            status: 'succeeded',
            plan_type: input.profilePlan,
            interval: input.interval,
        });
    } catch (e) {
        console.error('[Paystack/fulfill] billings insert', e);
    }

    try {
        await supabase.from('notifications').insert({
            user_id: input.userId,
            type: 'payment_succeeded',
            title: 'Payment successful',
            message: `Your plan is now ${input.profilePlan}.`,
            link: '/app',
        });
    } catch (e) {
        console.error('[Paystack/fulfill] notification', e);
    }

    console.log('[Paystack/fulfill] upgraded', input.userId, input.profilePlan);
    return true;
}
