'use client';

import type { PNodeSummaryStats } from '@/types/pnode';
import { Card, CardContent } from '@/components/ui/card';

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
    icon: React.ReactNode;
    color?: 'emerald' | 'red' | 'amber' | 'blue' | 'purple' | 'cyan';
    isLoading?: boolean;
}

function StatCard({ label, value, subValue, icon, color = 'emerald', isLoading }: StatCardProps) {
    const colorConfig = {
        emerald: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            text: 'text-emerald-400',
            glow: 'group-hover:shadow-emerald-500/20',
            iconBg: 'bg-emerald-500/20',
        },
        red: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            text: 'text-red-400',
            glow: 'group-hover:shadow-red-500/20',
            iconBg: 'bg-red-500/20',
        },
        amber: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            text: 'text-amber-400',
            glow: 'group-hover:shadow-amber-500/20',
            iconBg: 'bg-amber-500/20',
        },
        blue: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            text: 'text-blue-400',
            glow: 'group-hover:shadow-blue-500/20',
            iconBg: 'bg-blue-500/20',
        },
        purple: {
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            text: 'text-purple-400',
            glow: 'group-hover:shadow-purple-500/20',
            iconBg: 'bg-purple-500/20',
        },
        cyan: {
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/20',
            text: 'text-cyan-400',
            glow: 'group-hover:shadow-cyan-500/20',
            iconBg: 'bg-cyan-500/20',
        },
    };

    const config = colorConfig[color];

    return (
        <Card className={`group relative overflow-hidden border ${config.border} ${config.bg} backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${config.glow} card-hover`}>
            <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2">
                            {label}
                        </p>
                        {isLoading ? (
                            <div className="h-8 w-20 bg-white/10 rounded animate-pulse" />
                        ) : (
                            <p className={`text-2xl sm:text-3xl font-bold ${config.text} truncate`}>
                                {value}
                            </p>
                        )}
                        {subValue && !isLoading && (
                            <p className="text-xs text-muted-foreground mt-1.5">{subValue}</p>
                        )}
                    </div>
                    <div className={`p-2.5 rounded-xl ${config.iconBg} ${config.text}`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
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
                color="emerald"
                isLoading={isLoading}
                icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                }
            />

            {/* Offline Nodes */}
            <StatCard
                label="Offline"
                value={stats.offlineNodes}
                subValue={stats.degradedNodes > 0 ? `${stats.degradedNodes} degraded` : 'All healthy'}
                color={stats.offlineNodes > 0 ? 'red' : 'emerald'}
                isLoading={isLoading}
                icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                    </svg>
                }
            />

            {/* Average Performance */}
            <StatCard
                label="Avg Performance"
                value={`${stats.avgPerformanceScore}%`}
                subValue="network score"
                color={stats.avgPerformanceScore >= 80 ? 'emerald' : stats.avgPerformanceScore >= 50 ? 'amber' : 'red'}
                isLoading={isLoading}
                icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                }
            />

            {/* Storage Used */}
            <StatCard
                label="Storage"
                value={formatBytes(stats.totalStorageUsed)}
                subValue={`${storagePercent}% utilized`}
                color="purple"
                isLoading={isLoading}
                icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                }
            />

            {/* Total Staked (shown only on lg) */}
            <div className="hidden lg:block col-span-2">
                <StatCard
                    label="Total Staked"
                    value={`${formatNumber(stats.totalStaked / 1e9)} XAND`}
                    subValue="delegated across network"
                    color="cyan"
                    isLoading={isLoading}
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
            </div>
        </div>
    );
}
