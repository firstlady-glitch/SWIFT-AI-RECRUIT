import { NextResponse } from 'next/server';

import { acceptPaymentsServer } from '@/lib/billing';

export async function GET() {
    return NextResponse.json({
        acceptPayments: acceptPaymentsServer(),
        paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || null,
    });
}
