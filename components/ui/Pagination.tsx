import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    page: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    onNextPage: () => void;
    onPrevPage: () => void;
    onGoToPage: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
    showPageSize?: boolean;
}

export function Pagination({
    page,
    totalPages,
    totalCount,
    pageSize,
    hasNextPage,
    hasPrevPage,
    onNextPage,
    onPrevPage,
    onGoToPage,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100],
    showPageSize = true
}: PaginationProps) {
    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, totalCount);

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const showPages = 5;

        if (totalPages <= showPages + 2) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);

            if (page > 3) pages.push('ellipsis');

            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);

            for (let i = start; i <= end; i++) pages.push(i);

            if (page < totalPages - 2) pages.push('ellipsis');

            pages.push(totalPages);
        }

        return pages;
    };

    if (totalCount === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            {/* Info */}
            <div className="text-sm text-gray-400">
                Showing {startItem}-{endItem} of {totalCount}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
                {/* First page */}
                <button
                    onClick={() => onGoToPage(1)}
                    disabled={!hasPrevPage}
                    className="p-2 rounded-lg border border-gray-800 bg-[#15171e] text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="First page"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous */}
                <button
                    onClick={onPrevPage}
                    disabled={!hasPrevPage}
                    className="p-2 rounded-lg border border-gray-800 bg-[#15171e] text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                <div className="hidden sm:flex items-center gap-1">
                    {getPageNumbers().map((p, idx) =>
                        p === 'ellipsis' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">...</span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => onGoToPage(p)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === p
                                        ? 'bg-[var(--primary-blue)] text-white'
                                        : 'border border-gray-800 bg-[#15171e] text-gray-400 hover:text-white hover:border-gray-700'
                                    }`}
                            >
                                {p}
                            </button>
                        )
                    )}
                </div>

                {/* Mobile page indicator */}
                <span className="sm:hidden text-sm text-gray-400 px-2">
                    {page} / {totalPages}
                </span>

                {/* Next */}
                <button
                    onClick={onNextPage}
                    disabled={!hasNextPage}
                    className="p-2 rounded-lg border border-gray-800 bg-[#15171e] text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Next page"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last page */}
                <button
                    onClick={() => onGoToPage(totalPages)}
                    disabled={!hasNextPage}
                    className="p-2 rounded-lg border border-gray-800 bg-[#15171e] text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Last page"
                >
                    <ChevronsRight className="w-4 h-4" />
                </button>
            </div>

            {/* Page size selector */}
            {showPageSize && onPageSizeChange && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Per page:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="bg-[#15171e] border border-gray-800 rounded-lg px-2 py-1 text-sm text-white focus:border-[var(--primary-blue)] focus:outline-none"
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
