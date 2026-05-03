import { NextRequest, NextResponse } from 'next/server';

import { sendEmailNotification, EMAIL_ENABLED } from '@/lib/notifications';

const INBOX =
    process.env.CONTACT_INBOX_EMAIL || 'support@swiftairecruit.com';

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const firstName = String(body.firstName ?? '').trim();
        const lastName = String(body.lastName ?? '').trim();
        const email = String(body.email ?? '').trim();
        const subject = String(body.subject ?? '').trim();
        const message = String(body.message ?? '').trim();

        if (!firstName || !lastName || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'All fields are required.' },
                { status: 400 }
            );
        }

        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailOk) {
            return NextResponse.json(
                { error: 'Please enter a valid email address.' },
                { status: 400 }
            );
        }

        const subjectLabels: Record<string, string> = {
            support: 'Technical Support',
            sales: 'Sales & Pricing',
            partnership: 'Partnership',
            other: 'Other',
        };
        const subjectLine = subjectLabels[subject] || subject;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 640px;">
                <h2 style="color: #1a1a2e;">Website contact form</h2>
                <p><strong>From:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}<br/>
                <strong>Email:</strong> ${escapeHtml(email)}</p>
                <p><strong>Topic:</strong> ${escapeHtml(subjectLine)}</p>
                <div style="background:#f4f4f5;padding:16px;border-radius:8px;white-space:pre-wrap;">${escapeHtml(message)}</div>
            </div>
        `;

        const sent = await sendEmailNotification({
            to: INBOX,
            replyTo: email,
            subject: `[SwiftAI Contact] ${subjectLine} — ${firstName} ${lastName}`,
            html,
            text: `From: ${firstName} ${lastName} <${email}>\nTopic: ${subjectLine}\n\n${message}`,
        });

        if (!EMAIL_ENABLED || !sent) {
            return NextResponse.json(
                {
                    error: 'Email delivery is not configured on this server.',
                    fallback: true,
                    mailto: `mailto:${INBOX}?subject=${encodeURIComponent(`Contact: ${subjectLine}`)}&body=${encodeURIComponent(`${message}\n\n— ${firstName} ${lastName}\n${email}`)}`,
                },
                { status: 503 }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('[api/contact]', e);
        return NextResponse.json(
            { error: 'Could not send your message. Please try email or WhatsApp.' },
            { status: 500 }
        );
    }
}
