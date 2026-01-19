'use client';

import { ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
    key: keyof T | string;
    header: string;
    width?: string;
    sortable?: boolean;
    render?: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyField: keyof T;
    onRowClick?: (row: T) => void;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
    onSort?: (column: string) => void;
    emptyMessage?: string;
    emptyState?: ReactNode;
    className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    keyField,
    onRowClick,
    sortColumn,
    sortDirection,
    onSort,
    emptyMessage = 'No data available',
    emptyState,
    className = ''
}: DataTableProps<T>) {
    const getValue = (row: T, key: string): unknown => {
        const keys = key.split('.');
        let value: unknown = row;
        for (const k of keys) {
            value = (value as Record<string, unknown>)?.[k];
        }
        return value;
    };

    const renderCell = (row: T, column: Column<T>, index: number): ReactNode => {
        if (column.render) {
            return column.render(row, index);
        }
        const value = getValue(row, column.key as string);
        if (value === null || value === undefined) return '-';
        if (Array.isArray(value)) return value.join(', ');
        return String(value);
    };

    const handleSort = (column: Column<T>) => {
        if (column.sortable && onSort) {
            onSort(column.key as string);
        }
    };

    if (data.length === 0) {
        if (emptyState) {
            return (
                <div className={`bg-[#15171e] border border-gray-800 rounded-xl ${className}`}>
                    {emptyState}
                </div>
            );
        }
        return (
            <div className={`bg-[#15171e] border border-gray-800 rounded-xl p-12 text-center ${className}`}>
                <p className="text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={`bg-[#15171e] border border-gray-800 rounded-xl overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-800 bg-[#0b0c0f]">
                            {columns.map((column) => (
                                <th
                                    key={column.key as string}
                                    className={`text-left text-sm font-medium text-gray-400 px-4 py-3 ${column.sortable ? 'cursor-pointer hover:text-white' : ''
                                        }`}
                                    style={{ width: column.width }}
                                    onClick={() => handleSort(column)}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.header}
                                        {column.sortable && sortColumn === column.key && (
                                            sortDirection === 'asc'
                                                ? <ChevronUp className="w-4 h-4" />
                                                : <ChevronDown className="w-4 h-4" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr
                                key={String(row[keyField])}
                                className={`border-b border-gray-800/50 last:border-0 ${onRowClick
                                    ? 'cursor-pointer hover:bg-[#1a1c24] transition-colors'
                                    : ''
                                    }`}
                                onClick={() => onRowClick?.(row)}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key as string}
                                        className="px-4 py-4 text-sm text-gray-300"
                                    >
                                        {renderCell(row, column, index)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Status badge helper
interface StatusBadgeProps {
    status: string;
    variant?: 'application' | 'job' | 'interview';
}

const statusColors: Record<string, Record<string, string>> = {
    application: {
        applied: 'bg-blue-500/20 text-blue-400',
        reviewed: 'bg-purple-500/20 text-purple-400',
        shortlisted: 'bg-cyan-500/20 text-cyan-400',
        interview: 'bg-orange-500/20 text-orange-400',
        offer: 'bg-green-500/20 text-green-400',
        hired: 'bg-emerald-500/20 text-emerald-400',
        rejected: 'bg-red-500/20 text-red-400',
    },
    job: {
        draft: 'bg-gray-500/20 text-gray-400',
        published: 'bg-green-500/20 text-green-400',
        closed: 'bg-orange-500/20 text-orange-400',
        archived: 'bg-red-500/20 text-red-400',
    },
    interview: {
        scheduled: 'bg-blue-500/20 text-blue-400',
        completed: 'bg-green-500/20 text-green-400',
        cancelled: 'bg-red-500/20 text-red-400',
        no_show: 'bg-orange-500/20 text-orange-400',
    },
};

export function StatusBadge({ status, variant = 'application' }: StatusBadgeProps) {
    const colors = statusColors[variant]?.[status] || 'bg-gray-500/20 text-gray-400';

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colors}`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
}
