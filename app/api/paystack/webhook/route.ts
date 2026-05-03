import { NextRequest, NextResponse } from 'next/server';

import { fulfillPaystackPayment } from '@/lib/paystack-fulfill';
import { verifyPaystackSignature } from '@/lib/paystack';

export async function POST(request: NextRequest) {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!verifyPaystackSignature(rawBody, signature)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    let event: { event?: string; data?: Record<string, unknown> };
    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (event.event !== 'charge.success') {
        return NextResponse.json({ received: true });
    }

    const data = event.data as {
        reference?: string;
        amount?: number;
        currency?: string;
        status?: string;
        customer?: { customer_code?: string };
        metadata?: Record<string, string>;
    };

    if (!data.reference || data.status !== 'success') {
        return NextResponse.json({ received: true });
    }

    const meta = data.metadata || {};
    const userId = meta.user_id;
    const profilePlan = meta.profile_plan;
    const interval = meta.interval || 'monthly';

    if (!userId || !profilePlan) {
        console.warn('[paystack/webhook] missing metadata', data.reference);
        return NextResponse.json({ received: true });
    }

    try {
        await fulfillPaystackPayment({
            reference: data.reference,
            userId,
            profilePlan,
            interval,
            amountKobo: data.amount || 0,
            currency: data.currency || 'NGN',
            paystackCustomerCode: data.customer?.customer_code ?? null,
        });
    } catch (e) {
        console.error('[paystack/webhook] fulfill', e);
        return NextResponse.json({ error: 'Fulfill failed' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
