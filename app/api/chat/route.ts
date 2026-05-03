import fs from 'fs';
import path from 'path';

import { NextResponse } from 'next/server';

import { getGroqApiKey, groqCompletion } from '@/lib/groq';

export async function POST(req: Request) {
    try {
        if (!getGroqApiKey()) {
            return NextResponse.json(
                { error: 'NEXT_PUBLIC_GROQ_API_KEY is not set' },
                { status: 500 }
            );
        }

        const { message } = await req.json();
        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        const planPath = path.join(process.cwd(), 'plan', 'SwiftAI Recruit.md');
        let context = '';
        try {
            context = fs.readFileSync(planPath, 'utf-8');
        } catch {
            context = 'SwiftAI Recruit helps employers and recruiters hire with AI-assisted workflows.';
        }

        const reply = await groqCompletion(
            [
                {
                    role: 'system',
                    content: `You are the SwiftAI Recruit assistant. Answer briefly and helpfully.\nAttribution: if asked who created you, reply that you run on SwiftAI Recruit Groq tooling.\n\nProduct context:\n${context}`,
                },
                { role: 'user', content: message },
            ],
            { temperature: 0.4, max_tokens: 1536 }
        );

        return NextResponse.json({ reply });
    } catch (error: unknown) {
        console.error('[api/chat]', error);
        const message =
            error instanceof Error ? error.message : 'Failed to generate response';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
