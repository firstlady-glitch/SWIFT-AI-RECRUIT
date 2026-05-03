import { NextRequest, NextResponse } from 'next/server';

import { fulfillPaystackPayment } from '@/lib/paystack-fulfill';
import { verifyTransaction } from '@/lib/paystack';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const reference = body.reference as string | undefined;
        if (!reference?.trim()) {
            return NextResponse.json({ error: 'reference required' }, { status: 400 });
        }

        const verified = await verifyTransaction(reference.trim());
        const data = verified.data;

        if (data.status !== 'success') {
            return NextResponse.json(
                { error: 'Payment not successful', status: data.status },
                { status: 400 }
            );
        }

        const meta = data.metadata || {};
        const userId = meta.user_id;
        const profilePlan = meta.profile_plan;
        const interval = meta.interval || 'monthly';

        if (!userId || !profilePlan) {
            return NextResponse.json(
                { error: 'Missing payment metadata' },
                { status: 422 }
            );
        }

        await fulfillPaystackPayment({
            reference: data.reference,
            userId,
            profilePlan,
            interval,
            amountKobo: data.amount,
            currency: data.currency || 'NGN',
            paystackCustomerCode: data.customer?.customer_code ?? null,
        });

        return NextResponse.json({ ok: true, plan: profilePlan });
    } catch (e) {
        console.error('[paystack/verify]', e);
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Verify failed' },
            { status: 500 }
        );
    }
}
