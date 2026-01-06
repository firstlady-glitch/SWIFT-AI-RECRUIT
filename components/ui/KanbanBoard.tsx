'use client';

import { useState } from 'react';
import { GripVertical, MoreHorizontal } from 'lucide-react';

export interface KanbanItem {
    id: string;
    title: string;
    subtitle?: string;
    score?: number;
    avatarUrl?: string;
    tags?: string[];
    metadata?: Record<string, string | number>;
}

export interface KanbanColumn {
    id: string;
    title: string;
    color: string;
    items: KanbanItem[];
}

interface KanbanBoardProps {
    columns: KanbanColumn[];
    onMoveItem?: (itemId: string, fromColumn: string, toColumn: string) => void;
    onCardMove?: (itemId: string, toColumn: string) => void;
    onItemClick?: (item: KanbanItem) => void;
    renderCard?: (item: KanbanItem) => React.ReactNode;
    isUpdating?: boolean;
}

export function KanbanBoard({ columns, onMoveItem, onCardMove, onItemClick, renderCard, isUpdating }: KanbanBoardProps) {
    const [draggedItem, setDraggedItem] = useState<{ item: KanbanItem; fromColumn: string } | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    const handleDragStart = (item: KanbanItem, columnId: string) => {
        setDraggedItem({ item, fromColumn: columnId });
    };

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        setDragOverColumn(columnId);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e: React.DragEvent, toColumn: string) => {
        e.preventDefault();
        if (draggedItem && draggedItem.fromColumn !== toColumn) {
            if (onMoveItem) {
                onMoveItem(draggedItem.item.id, draggedItem.fromColumn, toColumn);
            } else if (onCardMove) {
                onCardMove(draggedItem.item.id, toColumn);
            }
        }
        setDraggedItem(null);
        setDragOverColumn(null);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverColumn(null);
    };

    const getScoreColor = (score?: number) => {
        if (!score) return 'text-gray-400';
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div className={`flex gap-4 overflow-x-auto pb-4 ${isUpdating ? 'opacity-70 pointer-events-none' : ''}`}>
            {columns.map((column) => (
                <div
                    key={column.id}
                    className={`flex-shrink-0 w-72 bg-[#0b0c0f] border border-gray-800 rounded-xl overflow-hidden transition-all ${dragOverColumn === column.id ? 'border-[var(--primary-blue)] ring-2 ring-[var(--primary-blue)]/20' : ''
                        }`}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                >
                    {/* Column Header */}
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${column.color}`} />
                            <h3 className="font-medium text-white text-sm">{column.title}</h3>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                            {column.items.length}
                        </span>
                    </div>

                    {/* Items */}
                    <div className="p-2 space-y-2 min-h-[200px] max-h-[500px] overflow-y-auto">
                        {column.items.map((item) => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={() => handleDragStart(item, column.id)}
                                onDragEnd={handleDragEnd}
                                onClick={() => onItemClick?.(item)}
                                className={`cursor-grab active:cursor-grabbing ${draggedItem?.item.id === item.id ? 'opacity-50' : ''}`}
                            >
                                {renderCard ? (
                                    renderCard(item)
                                ) : (
                                    <div className="bg-[#15171e] border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-all group">
                                        <div className="flex items-start gap-2">
                                            <GripVertical className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-white text-sm truncate">
                                                            {item.title}
                                                        </p>
                                                        {item.subtitle && (
                                                            <p className="text-xs text-gray-400 truncate mt-0.5">
                                                                {item.subtitle}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {item.score !== undefined && (
                                                        <span className={`text-xs font-bold ${getScoreColor(item.score)}`}>
                                                            {item.score}%
                                                        </span>
                                                    )}
                                                </div>

                                                {item.tags && item.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {item.tags.slice(0, 3).map((tag, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {item.tags.length > 3 && (
                                                            <span className="text-xs text-gray-500">
                                                                +{item.tags.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {column.items.length === 0 && (
                            <div className="text-center py-8 text-gray-600 text-sm">
                                No candidates
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
