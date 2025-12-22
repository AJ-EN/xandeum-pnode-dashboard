'use client';

import type { PNodeSummaryStats } from '@/types/pnode';

interface StatsBarProps {
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

function HeroStat({ value, label, isLoading }: { value: number; label: string; isLoading?: boolean }) {
    return (
        <div className="flex items-center gap-4">
            {isLoading ? (
                <div className="h-12 w-20 bg-white/5 rounded-lg animate-pulse" />
            ) : (
                <span className="text-5xl sm:text-6xl font-bold text-emerald-400 tabular-nums tracking-tight">
                    {value}
                </span>
            )}
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                {label}
            </span>
        </div>
    );
}

function SecondaryStat({
    value,
    label,
    color = 'neutral',
    isLoading
}: {
    value: string | number;
    label: string;
    color?: 'neutral' | 'success' | 'warning' | 'error';
    isLoading?: boolean;
}) {
    const colorClasses = {
        neutral: 'text-white/70',
        success: 'text-emerald-400',
        warning: 'text-amber-400',
        error: 'text-red-400',
    };

    return (
        <div className="flex flex-col items-start">
            {isLoading ? (
                <div className="h-5 w-12 bg-white/5 rounded animate-pulse mb-1" />
            ) : (
                <span className={`text-lg font-semibold tabular-nums ${colorClasses[color]}`}>
                    {value}
                </span>
            )}
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                {label}
            </span>
        </div>
    );
}

export function StatsGrid({ stats, isLoading }: StatsBarProps) {
    const storagePercent = stats.totalStorageCapacity > 0
        ? Math.round((stats.totalStorageUsed / stats.totalStorageCapacity) * 100)
        : 0;

    // Determine if there are any issues
    const hasOffline = stats.offlineNodes > 0;
    const hasDegraded = stats.degradedNodes > 0;

    return (
        <div className="glass-card px-6 sm:px-8 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
                {/* Hero Stat - Online Nodes */}
                <HeroStat
                    value={stats.onlineNodes}
                    label="Online"
                    isLoading={isLoading}
                />

                {/* Divider */}
                <div className="hidden sm:block w-px h-10 bg-white/10" />

                {/* Secondary Stats */}
                <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                    {/* Offline/Degraded Status */}
                    <div className="flex items-center gap-4">
                        <SecondaryStat
                            value={stats.offlineNodes}
                            label="Offline"
                            color={hasOffline ? 'error' : 'success'}
                            isLoading={isLoading}
                        />
                        {hasDegraded && (
                            <SecondaryStat
                                value={stats.degradedNodes}
                                label="Degraded"
                                color="warning"
                                isLoading={isLoading}
                            />
                        )}
                    </div>

                    {/* Performance */}
                    <SecondaryStat
                        value={`${stats.avgPerformanceScore}%`}
                        label="Performance"
                        color={stats.avgPerformanceScore >= 80 ? 'success' : stats.avgPerformanceScore >= 50 ? 'warning' : 'error'}
                        isLoading={isLoading}
                    />

                    {/* Storage */}
                    <SecondaryStat
                        value={formatBytes(stats.totalStorageUsed)}
                        label={`${storagePercent}% Used`}
                        color="neutral"
                        isLoading={isLoading}
                    />

                    {/* Staked */}
                    <SecondaryStat
                        value={`${formatNumber(stats.totalStaked / 1e9)} XAND`}
                        label="Staked"
                        color="neutral"
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}
