import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    trend?: {
        value: number;
        label?: string;
    };
    subtitle?: string;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'cyan';
    className?: string;
}

const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    purple: 'bg-purple-500/10 text-purple-500',
    orange: 'bg-orange-500/10 text-orange-500',
    pink: 'bg-pink-500/10 text-pink-500',
    cyan: 'bg-cyan-500/10 text-cyan-500',
};

export function StatsCard({
    title,
    value,
    icon,
    trend,
    subtitle,
    color = 'blue',
    className = ''
}: StatsCardProps) {
    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend.value > 0) return <TrendingUp className="w-4 h-4" />;
        if (trend.value < 0) return <TrendingDown className="w-4 h-4" />;
        return <Minus className="w-4 h-4" />;
    };

    const getTrendColor = () => {
        if (!trend) return '';
        if (trend.value > 0) return 'text-green-400';
        if (trend.value < 0) return 'text-red-400';
        return 'text-gray-400';
    };

    return (
        <div className={`bg-[#15171e] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors ${className}`}>
            <div className="flex items-start justify-between mb-4">
                <span className="text-sm text-gray-400">{title}</span>
                {icon && (
                    <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                        {icon}
                    </div>
                )}
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>

                {trend && (
                    <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
                        {getTrendIcon()}
                        <span>{Math.abs(trend.value)}%</span>
                        {trend.label && (
                            <span className="text-gray-500 ml-1">{trend.label}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Grid wrapper for multiple stats
interface StatsGridProps {
    children: ReactNode;
    columns?: 2 | 3 | 4;
}

export function StatsGrid({ children, columns = 4 }: StatsGridProps) {
    const gridCols = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <div className={`grid gap-4 ${gridCols[columns]}`}>
            {children}
        </div>
    );
}
