import { NextResponse } from 'next/server';
import { ACCEPT_PAYMENTS } from '@/lib/stripe';

// Expose payment status to client
export async function GET() {
    return NextResponse.json({
        acceptPayments: ACCEPT_PAYMENTS,
    });
}
