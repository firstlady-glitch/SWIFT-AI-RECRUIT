'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function PaymentCompleteInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const reference =
        searchParams.get('reference') || searchParams.get('trxref') || '';
    const [status, setStatus] = useState<'loading' | 'ok' | 'err'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!reference) {
            setStatus('err');
            setMessage('Missing payment reference.');
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/paystack/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reference }),
                });
                const data = await res.json().catch(() => ({}));
                if (cancelled) return;
                if (res.ok) {
                    setStatus('ok');
                    setMessage('Your plan is updated. Redirecting…');
                    setTimeout(() => router.push('/app'), 2000);
                } else {
                    setStatus('err');
                    setMessage(
                        typeof data.error === 'string'
                            ? data.error
                            : 'Verification failed. If you were charged, contact support with your reference.'
                    );
                }
            } catch {
                if (!cancelled) {
                    setStatus('err');
                    setMessage('Network error during verification.');
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [reference, router]);

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
            <div className="max-w-md w-full rounded-2xl border border-[var(--border)] bg-[var(--background-secondary)] p-8 text-center">
                <h1 className="text-xl font-bold mb-2">Payment</h1>
                {status === 'loading' && (
                    <p className="text-[var(--foreground-secondary)]">Confirming with Paystack…</p>
                )}
                {status === 'ok' && (
                    <p className="text-green-400">{message}</p>
                )}
                {status === 'err' && (
                    <>
                        <p className="text-red-400 mb-4">{message}</p>
                        <p className="text-sm text-[var(--foreground-secondary)] mb-4">
                            Reference: <code className="text-xs break-all">{reference || '—'}</code>
                        </p>
                        <Link href="/app" className="text-[var(--primary-blue)] hover:underline">
                            Back to app
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PaymentCompletePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                    Loading…
                </div>
            }
        >
            <PaymentCompleteInner />
        </Suspense>
    );
}
