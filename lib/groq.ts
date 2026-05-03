const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

/** Default matches Groq text-generation docs (fast general-purpose chat). */
export const GROQ_DEFAULT_MODEL =
    process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

export function getGroqApiKey(): string | undefined {
    return process.env.NEXT_PUBLIC_GROQ_API_KEY;
}

export type GroqMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

export async function groqCompletion(
    messages: GroqMessage[],
    options?: {
        model?: string;
        temperature?: number;
        max_tokens?: number;
    }
): Promise<string> {
    const key = getGroqApiKey();
    if (!key) {
        throw new Error('NEXT_PUBLIC_GROQ_API_KEY is not set');
    }

    const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: options?.model ?? GROQ_DEFAULT_MODEL,
            messages,
            temperature: options?.temperature ?? 0.55,
            max_tokens: options?.max_tokens ?? 2048,
        }),
    });

    const data = await res.json();
    if (!res.ok) {
        const msg =
            data?.error?.message ||
            data?.message ||
            `Groq API error (${res.status})`;
        throw new Error(msg);
    }

    const text = data.choices?.[0]?.message?.content as string | undefined;
    if (!text?.trim()) {
        throw new Error('Empty response from Groq');
    }

    return text;
}
