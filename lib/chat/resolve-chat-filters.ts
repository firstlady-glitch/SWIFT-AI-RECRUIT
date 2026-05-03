import type { ChatListingFilters } from '@/lib/chat/chat-live-types';

export type RawChatFiltersInput = {
    remoteOnly?: boolean;
    jobType?: string | null;
    locationContains?: string | null;
};

/**
 * Merges explicit API/body filters with light inference from the user message.
 * Explicit `remoteOnly: true` always wins; explicit `false` disables remote inference.
 */
export function resolveListingFilters(
    message: string,
    explicit: RawChatFiltersInput | undefined,
    inferFromMessage: boolean
): ChatListingFilters {
    const jobType =
        typeof explicit?.jobType === 'string' && explicit.jobType.trim()
            ? explicit.jobType.trim()
            : null;
    const locationContains =
        typeof explicit?.locationContains === 'string' &&
        explicit.locationContains.trim()
            ? explicit.locationContains.trim()
            : null;

    let remoteOnly = explicit?.remoteOnly === true;
    if (!remoteOnly && inferFromMessage && explicit?.remoteOnly !== false) {
        const onsite = /\b(onsite|on-site|in[\s-]office|in[\s-]person|no\s+remote|not\s+remote)\b/i.test(
            message
        );
        const wantsRemote = /\b(remote|wfh|work\s+from\s+home|distributed|globally\s+remote|fully\s+remote)\b/i.test(
            message
        );
        if (!onsite && wantsRemote) {
            remoteOnly = true;
        }
    }

    return {
        remoteOnly,
        jobType,
        locationContains,
    };
}

export function isRemoteJobRow(location: string | null, description: string): boolean {
    const loc = (location ?? '').toLowerCase();
    const desc = description.toLowerCase();
    const pattern =
        /\b(remote|wfh|work\s*from\s*home|work\s*anywhere|anywhere\s+in|distributed|fully\s+remote|100%\s*remote)\b/i;
    return pattern.test(loc) || pattern.test(desc);
}

export function rowMatchesFilters(
    row: {
        title: string;
        description: string;
        location: string | null;
        type: string | null;
    },
    filters: ChatListingFilters
): boolean {
    if (filters.remoteOnly && !isRemoteJobRow(row.location, row.description)) {
        return false;
    }
    if (filters.jobType) {
        const t = (row.type ?? '').trim().toLowerCase();
        if (t !== filters.jobType.trim().toLowerCase()) {
            return false;
        }
    }
    if (filters.locationContains) {
        const loc = (row.location ?? '').toLowerCase();
        if (!loc.includes(filters.locationContains.toLowerCase())) {
            return false;
        }
    }
    return true;
}
