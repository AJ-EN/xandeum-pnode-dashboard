'use client';

import type { PNodeSummaryStats } from '@/types/pnode';

interface StatsGridProps {
    stats: PNodeSummaryStats;
    isLoading?: boolean;
}

/** Format bytes to human readable string */
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/** Format large numbers with K/M/B suffixes */
function formatNumber(num: number): string {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
}

interface StatCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    color?: 'green' | 'red' | 'yellow' | 'blue' | 'purple';
    isLoading?: boolean;
}

function StatCard({ label, value, subValue, color = 'blue', isLoading }: StatCardProps) {
    const colorClasses = {
        green: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
        red: 'from-red-500/20 to-red-600/10 border-red-500/30',
        yellow: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
        purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    };

    const textColors = {
        green: 'text-emerald-400',
        red: 'text-red-400',
        yellow: 'text-amber-400',
        blue: 'text-blue-400',
        purple: 'text-purple-400',
    };

    return (
        <div
            className={`
                relative overflow-hidden rounded-xl border
                bg-gradient-to-br ${colorClasses[color]}
                backdrop-blur-xl p-4 sm:p-5
                transition-all duration-300
                hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20
            `}
        >
            {/* Glassmorphism highlight */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-1">
                {label}
            </p>

            {isLoading ? (
                <div className="h-8 w-20 bg-white/10 rounded animate-pulse" />
            ) : (
                <p className={`text-2xl sm:text-3xl font-bold ${textColors[color]}`}>
                    {value}
                </p>
            )}

            {subValue && !isLoading && (
                <p className="text-xs text-gray-500 mt-1">{subValue}</p>
            )}
        </div>
    );
}

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
    const storagePercent = stats.totalStorageCapacity > 0
        ? Math.round((stats.totalStorageUsed / stats.totalStorageCapacity) * 100)
        : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Online Nodes */}
            <StatCard
                label="Online"
                value={stats.onlineNodes}
                subValue={`of ${stats.totalNodes} total`}
                color="green"
                isLoading={isLoading}
            />

            {/* Offline Nodes */}
            <StatCard
                label="Offline"
                value={stats.offlineNodes}
                subValue={stats.degradedNodes > 0 ? `${stats.degradedNodes} degraded` : undefined}
                color={stats.offlineNodes > 0 ? 'red' : 'green'}
                isLoading={isLoading}
            />

            {/* Average Performance */}
            <StatCard
                label="Avg Performance"
                value={`${stats.avgPerformanceScore}%`}
                subValue="network score"
                color={stats.avgPerformanceScore >= 80 ? 'green' : stats.avgPerformanceScore >= 50 ? 'yellow' : 'red'}
                isLoading={isLoading}
            />

            {/* Storage Used */}
            <StatCard
                label="Storage"
                value={formatBytes(stats.totalStorageUsed)}
                subValue={`${storagePercent}% of ${formatBytes(stats.totalStorageCapacity)}`}
                color="purple"
                isLoading={isLoading}
            />

            {/* Total Staked (hidden on mobile, shown on lg) */}
            <div className="hidden lg:block col-span-2">
                <StatCard
                    label="Total Staked"
                    value={`${formatNumber(stats.totalStaked / 1e9)} XAND`}
                    subValue="delegated across network"
                    color="blue"
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
