import { useState, useCallback } from 'react';

interface UsePaginationOptions {
    pageSize?: number;
    initialPage?: number;
}

interface UsePaginationReturn<T> {
    data: T[];
    isLoading: boolean;
    error: string | null;
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    setData: (data: T[], total: number) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    nextPage: () => void;
    prevPage: () => void;
    goToPage: (page: number) => void;
    setPageSize: (size: number) => void;
    reset: () => void;
}

export function usePagination<T = unknown>(
    options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
    const { pageSize: initialPageSize = 20, initialPage = 1 } = options;

    const [data, setDataState] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(initialPage);
    const [pageSize, setPageSizeState] = useState(initialPageSize);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const setData = useCallback((newData: T[], total: number) => {
        setDataState(newData);
        setTotalCount(total);
    }, []);

    const setLoading = useCallback((loading: boolean) => {
        setIsLoading(loading);
    }, []);

    const nextPage = useCallback(() => {
        if (hasNextPage) {
            setPage(prev => prev + 1);
        }
    }, [hasNextPage]);

    const prevPage = useCallback(() => {
        if (hasPrevPage) {
            setPage(prev => prev - 1);
        }
    }, [hasPrevPage]);

    const goToPage = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    }, [totalPages]);

    const setPageSize = useCallback((size: number) => {
        setPageSizeState(size);
        setPage(1); // Reset to first page when changing page size
    }, []);

    const reset = useCallback(() => {
        setDataState([]);
        setTotalCount(0);
        setPage(initialPage);
        setError(null);
    }, [initialPage]);

    return {
        data,
        isLoading,
        error,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
        setData,
        setLoading,
        setError,
        nextPage,
        prevPage,
        goToPage,
        setPageSize,
        reset,
    };
}

// Helper to calculate offset for Supabase range queries
export function getPaginationRange(page: number, pageSize: number) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    return { from, to };
}
