import { NextRequest, NextResponse } from 'next/server';

import {
    acceptPaymentsServer,
    getPaystackAmountKobo,
    resolvePaystackBilling,
} from '@/lib/billing';
import { initializeTransaction } from '@/lib/paystack';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const {
        planKey,
        interval = 'monthly',
        role = 'applicant',
    } = body as {
        planKey: string;
        interval: 'monthly' | 'annual';
        role: string;
    };

    if (!acceptPaymentsServer()) {
        return NextResponse.json({
            redirect: true,
            url: `/auth/register?role=${encodeURIComponent(role)}&plan=${encodeURIComponent(planKey)}`,
            message: 'Payments are not configured.',
        });
    }

    const supabase = await createServerSupabaseClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({
            redirect: true,
            url: `/auth/register?role=${encodeURIComponent(role)}&plan=${encodeURIComponent(planKey)}`,
            message: 'Please sign in first.',
        });
    }

    const resolved = resolvePaystackBilling(planKey, role);
    if (!resolved) {
        return NextResponse.json({ error: 'Invalid plan for this role.' }, { status: 400 });
    }

    const amount = getPaystackAmountKobo(resolved.amountKey, interval);
    if (!amount || amount < 100) {
        return NextResponse.json(
            { error: 'This plan is not payable online. Contact sales.' },
            { status: 400 }
        );
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

    const email = profile?.email || user.email;
    if (!email) {
        return NextResponse.json({ error: 'No email on profile.' }, { status: 400 });
    }

    const origin =
        request.headers.get('origin') ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3000';

    const reference = `sw_${user.id.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const currency = (process.env.PAYSTACK_CURRENCY || 'NGN').toUpperCase();

    try {
        const init = await initializeTransaction({
            email,
            amount,
            currency,
            reference,
            callback_url: `${origin}/payment/complete`,
            metadata: {
                user_id: String(user.id),
                profile_plan: String(resolved.profilePlan),
                interval: String(interval),
                role: String(role),
                plan_key: String(planKey),
            },
        });

        return NextResponse.json({
            authorization_url: init.data.authorization_url,
            access_code: init.data.access_code,
            reference: init.data.reference,
            /** @deprecated use authorization_url */
            url: init.data.authorization_url,
        });
    } catch (e) {
        console.error('[paystack/initialize]', e);
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Initialize failed' },
            { status: 500 }
        );
    }
}
