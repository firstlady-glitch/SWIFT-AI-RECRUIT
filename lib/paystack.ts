import crypto from 'crypto';

const BASE = 'https://api.paystack.co';

export function getPaystackSecret(): string | undefined {
    return process.env.PAYSTACK_SECRET_KEY?.trim();
}

export async function paystackRequest<T>(
    path: string,
    init?: RequestInit
): Promise<T> {
    const secret = getPaystackSecret();
    if (!secret) throw new Error('PAYSTACK_SECRET_KEY is not set');

    const res = await fetch(`${BASE}${path}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${secret}`,
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
        },
    });

    const json = (await res.json()) as T & {
        status: boolean;
        message: string;
    };
    if (!res.ok || !(json as { status?: boolean }).status) {
        const msg =
            (json as { message?: string }).message || `Paystack error ${res.status}`;
        throw new Error(msg);
    }
    return json;
}

export type InitializeResponse = {
    status: boolean;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
};

export async function initializeTransaction(body: Record<string, unknown>) {
    return paystackRequest<InitializeResponse>('/transaction/initialize', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

export type VerifyResponse = {
    status: boolean;
    data: {
        id: number;
        reference: string;
        amount: number;
        currency: string;
        status: string;
        customer: {
            id: number;
            email: string;
            customer_code: string;
        } | null;
        metadata?: Record<string, string>;
    };
};

export async function verifyTransaction(reference: string) {
    return paystackRequest<VerifyResponse>(
        `/transaction/verify/${encodeURIComponent(reference)}`
    );
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
    const secret = getPaystackSecret();
    if (!secret || !signature) return false;
    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    return hash === signature;
}
