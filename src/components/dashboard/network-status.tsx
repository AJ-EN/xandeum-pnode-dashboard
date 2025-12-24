'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { NetworkStatus } from '@/types/pnode';
import {
    Activity,
    Layers,
    Clock,
    Zap,
    Server,
    TrendingUp,
} from 'lucide-react';

interface NetworkStatusCardProps {
    status: NetworkStatus | null;
    isLoading: boolean;
}

function formatNumber(num: number): string {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
}

function formatSlot(slot: number): string {
    return slot.toLocaleString();
}

export function NetworkStatusCard({ status, isLoading }: NetworkStatusCardProps) {
    if (isLoading || !status) {
        return (
            <Card className="glass-card animate-fade-in-up">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium">Network Status</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-1">
                                <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                                <div className="h-5 w-24 bg-white/10 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const items = [
        {
            icon: <Server className="h-3.5 w-3.5" />,
            label: 'Health',
            value: (
                <Badge
                    variant="outline"
                    className={
                        status.health === 'ok'
                            ? 'status-online'
                            : status.health === 'degraded'
                                ? 'status-degraded'
                                : 'status-offline'
                    }
                >
                    {status.health.toUpperCase()}
                </Badge>
            ),
        },
        {
            icon: <Layers className="h-3.5 w-3.5" />,
            label: 'Epoch',
            value: (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{status.epoch}</span>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-[60px]">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all"
                            style={{ width: `${status.epochProgress}%` }}
                        />
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {status.epochProgress.toFixed(0)}%
                    </span>
                </div>
            ),
        },
        {
            icon: <Clock className="h-3.5 w-3.5" />,
            label: 'Slot',
            value: <span className="text-sm font-mono">{formatSlot(status.slot)}</span>,
        },
        {
            icon: <TrendingUp className="h-3.5 w-3.5" />,
            label: 'Block Height',
            value: <span className="text-sm font-mono">{formatSlot(status.blockHeight)}</span>,
        },
        {
            icon: <Zap className="h-3.5 w-3.5" />,
            label: 'TPS',
            value: (
                <span className="text-sm font-medium text-yellow-400">
                    {status.tps} tx/s
                </span>
            ),
        },
        {
            icon: <Activity className="h-3.5 w-3.5" />,
            label: 'Transactions',
            value: <span className="text-sm">{formatNumber(status.transactionCount)}</span>,
        },
    ];

    return (
        <Card className="glass-card animate-fade-in-up">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium">Network Status</h3>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                        v{status.version}
                    </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {items.map((item, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex items-center gap-1 text-muted-foreground">
                                {item.icon}
                                <span className="text-xs">{item.label}</span>
                            </div>
                            {item.value}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
