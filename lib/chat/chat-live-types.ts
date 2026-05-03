/** Filters applied to the public job listing snapshot (LIVE DATA). */
export type ChatListingFilters = {
    remoteOnly: boolean;
    /** Exact-ish match on jobs.type (e.g. Full-time), case-insensitive. */
    jobType: string | null;
    /** Case-insensitive substring on jobs.location. */
    locationContains: string | null;
};

export type ChatViewerRole = 'applicant' | 'employer' | 'recruiter' | 'admin';

export type ChatViewerContext = {
    /** guest = not signed in; still receives full public routes and both listing counts. */
    state: 'guest' | 'signed_in';
    role: ChatViewerRole | null;
    /** Supabase auth user id — use in paths as {userId} when present. */
    userId: string | null;
};

export const CHAT_VIEWER_ROLES: readonly ChatViewerRole[] = [
    'applicant',
    'employer',
    'recruiter',
    'admin',
] as const;

export function parseViewerRole(value: unknown): ChatViewerRole | null {
    if (typeof value !== 'string') return null;
    return CHAT_VIEWER_ROLES.includes(value as ChatViewerRole)
        ? (value as ChatViewerRole)
        : null;
}
