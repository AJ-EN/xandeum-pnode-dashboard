'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { PNodeSummaryStats } from '@/types/pnode';
import {
    Server,
    HardDrive,
    Activity,
    Coins,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react';

interface StatsGridProps {
    stats: PNodeSummaryStats;
    isLoading: boolean;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
}

function formatXand(lamports: number): string {
    const xand = lamports / 1e9;
    if (xand >= 1_000_000) return `${(xand / 1_000_000).toFixed(2)}M`;
    if (xand >= 1_000) return `${(xand / 1_000).toFixed(1)}K`;
    return xand.toFixed(0);
}

interface StatCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    isLoading: boolean;
    delay: number;
}

function StatCard({ title, value, subtitle, icon, trend, trendValue, isLoading, delay }: StatCardProps) {
    return (
        <Card className={`glass-card animate-fade-in-up animate-delay-${delay}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                ) : (
                    <>
                        <div className="text-2xl font-bold tracking-tight">
                            {value}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            {subtitle && (
                                <span className="text-xs text-muted-foreground">
                                    {subtitle}
                                </span>
                            )}
                            {trend && trendValue && (
                                <span className={`flex items-center gap-0.5 text-xs font-medium ${trend === 'up' ? 'text-green-500' :
                                    trend === 'down' ? 'text-red-500' :
                                        'text-muted-foreground'
                                    }`}>
                                    {trend === 'up' && <TrendingUp className="h-3 w-3" />}
                                    {trend === 'down' && <TrendingDown className="h-3 w-3" />}
                                    {trend === 'neutral' && <Minus className="h-3 w-3" />}
                                    {trendValue}
                                </span>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
    const onlinePercentage = stats.totalNodes > 0
        ? Math.round((stats.onlineNodes / stats.totalNodes) * 100)
        : 0;

    const storageUsedPercentage = stats.totalStorageCapacity > 0
        ? Math.round((stats.totalStorageUsed / stats.totalStorageCapacity) * 100)
        : 0;

    // Check if extended metrics are available (not available from basic getClusterNodes)
    const hasStorageData = stats.totalStorageCapacity > 0;
    const hasPerformanceData = stats.avgPerformanceScore > 0;
    const hasStakingData = stats.totalStaked > 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Total pNodes"
                value={formatNumber(stats.totalNodes)}
                subtitle={`${stats.onlineNodes} online (${onlinePercentage}%)`}
                icon={<Server className="h-4 w-4" />}
                trend={onlinePercentage >= 90 ? 'up' : onlinePercentage >= 70 ? 'neutral' : 'down'}
                trendValue={`${onlinePercentage}% uptime`}
                isLoading={isLoading}
                delay={1}
            />
            <StatCard
                title="Storage Capacity"
                value={hasStorageData ? formatBytes(stats.totalStorageCapacity) : 'N/A'}
                subtitle={hasStorageData
                    ? `${formatBytes(stats.totalStorageUsed)} used (${storageUsedPercentage}%)`
                    : 'Requires extended pRPC'}
                icon={<HardDrive className="h-4 w-4" />}
                isLoading={isLoading}
                delay={2}
            />
            <StatCard
                title="Avg Performance"
                value={hasPerformanceData ? `${stats.avgPerformanceScore}%` : 'N/A'}
                subtitle={hasPerformanceData ? 'Network-wide score' : 'Requires extended pRPC'}
                icon={<Activity className="h-4 w-4" />}
                trend={hasPerformanceData
                    ? (stats.avgPerformanceScore >= 90 ? 'up' : stats.avgPerformanceScore >= 70 ? 'neutral' : 'down')
                    : undefined}
                trendValue={hasPerformanceData
                    ? (stats.avgPerformanceScore >= 90 ? 'Excellent' : stats.avgPerformanceScore >= 70 ? 'Good' : 'Needs attention')
                    : undefined}
                isLoading={isLoading}
                delay={3}
            />
            <StatCard
                title="Total Staked"
                value={hasStakingData ? `${formatXand(stats.totalStaked)} XAND` : 'N/A'}
                subtitle={hasStakingData ? 'Across all pNodes' : 'Requires extended pRPC'}
                icon={<Coins className="h-4 w-4" />}
                isLoading={isLoading}
                delay={4}
            />
        </div>
    );
}
