import { NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

async function extractTextFromBuffer(buf: Buffer, contentType: string | null) {
    const ct = (contentType || '').toLowerCase();
    if (ct.includes('pdf') || ct.includes('octet-stream')) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse') as (b: Buffer) => Promise<{ text: string }>;
        const data = await pdfParse(buf);
        return (data.text || '').trim();
    }
    if (ct.includes('text/plain')) {
        return buf.toString('utf-8').trim();
    }
    // Try PDF parse if URL path ends with .pdf
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (b: Buffer) => Promise<{ text: string }>;
    try {
        const data = await pdfParse(buf);
        const t = (data.text || '').trim();
        if (t.length > 50) return t;
    } catch {
        /* not a pdf */
    }
    return '';
}

/**
 * Returns extracted text from the authenticated user's `profiles.resume_url`
 * (Cloudinary URL or any public HTTPS URL to a PDF).
 */
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('resume_url')
            .eq('id', user.id)
            .single();

        if (error || !profile?.resume_url?.trim()) {
            return NextResponse.json({
                text: null,
                resume_url: null,
                message: 'No resume on file',
            });
        }

        const url = profile.resume_url.trim();
        if (!url.startsWith('http')) {
            return NextResponse.json(
                {
                    error:
                        'Resume path is not a full URL. Re-upload your resume from profile settings.',
                },
                { status: 422 }
            );
        }

        const fileRes = await fetch(url, { redirect: 'follow' });
        if (!fileRes.ok) {
            return NextResponse.json(
                { error: 'Could not download resume file.' },
                { status: 502 }
            );
        }

        const buf = Buffer.from(await fileRes.arrayBuffer());
        const contentType = fileRes.headers.get('content-type');
        const text = await extractTextFromBuffer(buf, contentType);

        if (!text || text.length < 40) {
            return NextResponse.json({
                text: null,
                resume_url: url,
                message:
                    'Could not read enough text from this file. Paste your resume text manually, or upload a text-based PDF.',
            });
        }

        return NextResponse.json({
            text,
            resume_url: url,
            source: 'profile_resume',
        });
    } catch (e) {
        console.error('[resume-text]', e);
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Failed to read resume' },
            { status: 500 }
        );
    }
}
