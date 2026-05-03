import type { ChatListingFilters } from '@/lib/chat/chat-live-types';
import {
    type RawChatFiltersInput,
    resolveListingFilters,
    rowMatchesFilters,
} from '@/lib/chat/resolve-chat-filters';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export type ChatJobLine = {
    id: string;
    title: string;
    company: string;
    location: string | null;
    type: string | null;
    /** From the marketing job board ("View details"). */
    publicBoardPath: string;
    /** Job detail (works signed in or browsing). */
    applicantJobPath: string;
    applyPath: string;
};

export type JobsSnapshotForChat = {
    /** Total published + public rows returned from DB (before filter). */
    allPublicPublished: number;
    /** Rows matching listingFilters (subset of allPublicPublished). */
    matchingFilters: number;
    listingFilters: ChatListingFilters;
    relevantJobs: ChatJobLine[];
    fetchError?: string;
};

const STOP = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'to',
    'for',
    'of',
    'in',
    'on',
    'at',
    'i',
    'im',
    "i'm",
    'am',
    'is',
    'are',
    'be',
    'been',
    'being',
    'can',
    'could',
    'would',
    'should',
    'do',
    'does',
    'did',
    'you',
    'your',
    'we',
    'our',
    'my',
    'me',
    'they',
    'them',
    'their',
    'with',
    'from',
    'as',
    'by',
    'about',
    'into',
    'any',
    'some',
    'this',
    'that',
    'these',
    'those',
    'it',
    'its',
    'if',
    'so',
    'no',
    'not',
    'just',
    'very',
    'really',
    'also',
    'too',
    'how',
    'what',
    'when',
    'where',
    'why',
    'who',
    'which',
    'hey',
    'hi',
    'hello',
    'please',
    'thanks',
    'thank',
    'want',
    'wanna',
    'need',
    'like',
    'know',
    'think',
    'get',
    'got',
    'make',
    'use',
    'using',
    'here',
    'there',
    'job',
    'jobs',
    'work',
    'role',
    'roles',
    'apply',
    'applying',
    'application',
    'hire',
    'hired',
    'hiring',
    'career',
    'opportunity',
    'opportunities',
    'swiftai',
    'recruit',
    'platform',
    'website',
    'site',
]);

function tokenize(message: string): string[] {
    return message
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s-]/gi, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1 && !STOP.has(w));
}

function orgName(row: { organization: unknown }): string {
    const o = row.organization;
    if (Array.isArray(o)) {
        const first = o[0] as { name?: string } | undefined;
        return first?.name?.trim() || 'Company';
    }
    if (o && typeof o === 'object' && 'name' in o) {
        const n = (o as { name?: string }).name;
        return n?.trim() || 'Company';
    }
    return 'Company';
}

function scoreJob(
    title: string,
    description: string,
    company: string,
    terms: string[]
): number {
    if (terms.length === 0) return 0;
    const hay = `${title} ${description} ${company}`.toLowerCase();
    let score = 0;
    for (const t of terms) {
        if (hay.includes(t)) {
            score += t.length > 4 ? 4 : 2;
        }
    }
    return score;
}

type JobRow = {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    type: string | null;
    organization: unknown;
};

/**
 * Loads published + public jobs, applies listing filters, ranks matches for the user message.
 */
export async function getJobsSnapshotForChat(
    userMessage: string,
    options?: {
        filters?: RawChatFiltersInput;
        /** When true (default), remote-style keywords in the message tighten the listing set. */
        inferFiltersFromMessage?: boolean;
    }
): Promise<JobsSnapshotForChat> {
    const infer =
        options?.inferFiltersFromMessage !== undefined
            ? options.inferFiltersFromMessage
            : true;
    const listingFilters = resolveListingFilters(
        userMessage,
        options?.filters,
        infer
    );

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from('jobs')
        .select(
            `
            id,
            title,
            description,
            location,
            type,
            organization:organizations(name)
        `
        )
        .eq('status', 'published')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(120);

    if (error) {
        console.error('[chat jobs snapshot]', error.message);
        return {
            allPublicPublished: 0,
            matchingFilters: 0,
            listingFilters,
            relevantJobs: [],
            fetchError: error.message,
        };
    }

    const rows = (data ?? []) as JobRow[];
    const allPublicPublished = rows.length;

    const enrichedBase = rows.map((row) => {
        const company = orgName(row);
        const description = row.description ?? '';
        return {
            id: row.id,
            title: row.title,
            description,
            location: row.location,
            type: row.type,
            company,
        };
    });

    const filtered = enrichedBase.filter((row) =>
        rowMatchesFilters(row, listingFilters)
    );
    const matchingFilters = filtered.length;

    const terms = tokenize(userMessage);
    const scored = filtered.map((row) => ({
        ...row,
        score: scoreJob(row.title, row.description, row.company, terms),
    }));

    let picked: typeof scored;
    if (terms.length === 0) {
        picked = scored.slice(0, 8);
    } else {
        picked = [...scored].sort((a, b) => b.score - a.score).slice(0, 8);
        if (picked.length > 0 && picked.every((p) => p.score === 0)) {
            picked = scored.slice(0, 6);
        }
    }

    const relevantJobs: ChatJobLine[] = picked.map((j) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        type: j.type,
        publicBoardPath: `/jobs/${j.id}`,
        applicantJobPath: `/app/applicant/jobs/${j.id}`,
        applyPath: `/app/applicant/jobs/${j.id}/apply`,
    }));

    return {
        allPublicPublished,
        matchingFilters,
        listingFilters,
        relevantJobs,
    };
}
