import { NextRequest, NextResponse } from 'next/server';
import { getGroqApiKey, groqCompletion } from '@/lib/groq';

export async function POST(req: NextRequest) {
    if (!getGroqApiKey()) {
        return NextResponse.json(
            { error: 'NEXT_PUBLIC_GROQ_API_KEY is not configured' },
            { status: 500 }
        );
    }

    try {
        const { prompt } = await req.json();

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const text = await groqCompletion(
            [
                {
                    role: 'system',
                    content:
                        'You are an expert recruiting and hiring assistant for SwiftAI Recruit. Give clear, practical output. Prefer bullet lists or structured text when helpful. Avoid filler disclaimers.',
                },
                { role: 'user', content: prompt },
            ],
            { temperature: 0.45, max_tokens: 4096 }
        );

        return NextResponse.json({ result: text });
    } catch (error: unknown) {
        console.error('[api/ai/generate]', error);
        const message =
            error instanceof Error ? error.message : 'Failed to generate content';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
