'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { PNode, NetworkStatus, HistorySnapshot } from '@/types/pnode';
import { useHistory } from '@/hooks/use-history';

interface ActivityChartProps {
    nodes: PNode[];
    networkStatus: NetworkStatus | null;
    isLoading: boolean;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name?: string;
        value?: number;
        color?: string;
        dataKey?: string;
    }>;
    label?: string;
}

interface ChartDataPoint {
    time: string;
    timestamp: number;
    nodeCount: number;
    onlineCount: number;
    tps: number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-zinc-900/95 border border-white/10 rounded-lg p-3 shadow-xl backdrop-blur-sm">
            <p className="text-sm font-medium text-foreground mb-2">{label}</p>
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-muted-foreground">{entry.name}:</span>
                    <span className="font-medium">
                        {entry.dataKey === 'tps' ? `${entry.value} tx/s` : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Generate simulated historical data for the "last 30 minutes".
 * This provides a populated chart on first visit instead of empty state.
 */
function generateSimulatedHistory(
    currentNodeCount: number,
    currentOnlineCount: number,
    currentTps: number
): ChartDataPoint[] {
    const now = Date.now();
    const points: ChartDataPoint[] = [];
    const numPoints = 30; // 30 points = ~15 minutes of simulated history at 30s intervals

    for (let i = numPoints - 1; i >= 0; i--) {
        const timestamp = now - i * 30000; // 30 seconds apart
        // Add variance: ±15% for TPS, ±1-2 for node counts
        const tpsVariance = currentTps * (0.85 + Math.random() * 0.3);
        const nodeVariance = Math.floor(Math.random() * 3) - 1;
        const onlineVariance = Math.floor(Math.random() * 3) - 1;

        points.push({
            time: formatTime(timestamp),
            timestamp,
            nodeCount: Math.max(1, currentNodeCount + nodeVariance),
            onlineCount: Math.max(1, Math.min(currentNodeCount, currentOnlineCount + onlineVariance)),
            tps: Math.max(0, Math.round(tpsVariance)),
        });
    }

    return points;
}

export function ActivityChart({ nodes, networkStatus, isLoading }: ActivityChartProps) {
    const { history, addSnapshot, getRecentHistory } = useHistory();
    const lastSnapshotRef = useRef<number>(0);

    // Add snapshot when data updates (throttled to once per refresh cycle)
    useEffect(() => {
        if (nodes.length === 0 || isLoading) return;

        const now = Date.now();
        // Only add snapshot if at least 25 seconds have passed (allowing for slight timing variations)
        if (now - lastSnapshotRef.current < 25000) return;

        const onlineCount = nodes.filter((n) => n.status === 'online').length;

        addSnapshot({
            nodeCount: nodes.length,
            onlineCount,
            tps: networkStatus?.tps ?? 0,
            slot: networkStatus?.slot ?? 0,
        });

        lastSnapshotRef.current = now;
    }, [nodes, networkStatus, isLoading, addSnapshot]);

    // Get recent history for chart (last 60 data points = ~30 minutes)
    const chartData: ChartDataPoint[] = useMemo(() => {
        const recent = getRecentHistory(60);

        if (recent.length < 3 && nodes.length > 0) {
            // Not enough real history - show simulated data
            const onlineCount = nodes.filter((n) => n.status === 'online').length;
            return generateSimulatedHistory(
                nodes.length,
                onlineCount,
                networkStatus?.tps ?? 30
            );
        }

        return recent.map((snapshot: HistorySnapshot) => ({
            time: formatTime(snapshot.timestamp),
            timestamp: snapshot.timestamp,
            nodeCount: snapshot.nodeCount,
            onlineCount: snapshot.onlineCount,
            tps: snapshot.tps,
        }));
    }, [getRecentHistory, history, nodes, networkStatus?.tps]); // eslint-disable-line react-hooks/exhaustive-deps

    const hasRealData = history.length >= 3;
    const isSimulated = !hasRealData && chartData.length > 0;
    const currentTps = networkStatus?.tps ?? 0;
    const avgTps = chartData.length > 0
        ? Math.round(chartData.reduce((sum, d) => sum + d.tps, 0) / chartData.length)
        : 0;

    return (
        <Card className="glass-card animate-fade-in-up animate-delay-4">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base font-medium">Network Activity</CardTitle>
                            {hasRealData ? (
                                <span
                                    className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-500/10 text-green-500 border border-green-500/20"
                                    title="Real historical data from your session"
                                >
                                    REAL DATA
                                </span>
                            ) : isSimulated ? (
                                <span
                                    className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                    title="Simulated trend data - real data will replace this as it collects"
                                >
                                    SIMULATED
                                </span>
                            ) : (
                                <span
                                    className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                    title="Collecting data points - chart will populate over time"
                                >
                                    COLLECTING
                                </span>
                            )}
                        </div>
                        <CardDescription className="text-xs">
                            {hasRealData
                                ? `Last ${chartData.length} snapshots (updates every 30s)`
                                : isSimulated
                                    ? 'Showing projected trends • Real data will appear shortly'
                                    : 'Data points will appear as the page remains open'
                            }
                        </CardDescription>
                    </div>
                    <div className="flex gap-4 text-right">
                        <div>
                            <p className="text-xs text-muted-foreground">Current TPS</p>
                            <p className="text-lg font-semibold text-yellow-400">{currentTps}</p>
                        </div>
                        {hasRealData && (
                            <div>
                                <p className="text-xs text-muted-foreground">Avg TPS</p>
                                <p className="text-lg font-semibold text-muted-foreground">{avgTps}</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-2">
                {isLoading ? (
                    <div className="h-[200px] flex items-center justify-center">
                        <div className="animate-pulse text-muted-foreground text-sm">
                            Loading chart data...
                        </div>
                    </div>
                ) : !hasRealData ? (
                    <div className="h-[200px] flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm text-muted-foreground">Collecting data points...</p>
                        <p className="text-xs text-muted-foreground/60">
                            Keep this page open to see real network trends
                        </p>
                    </div>
                ) : (
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="nodesGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="rgba(255,255,255,0.05)"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(161, 161, 170, 0.6)', fontSize: 10 }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    yAxisId="tps"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(161, 161, 170, 0.6)', fontSize: 10 }}
                                    tickFormatter={(value) => `${value}`}
                                    domain={['dataMin - 5', 'dataMax + 5']}
                                />
                                <YAxis
                                    yAxisId="nodes"
                                    orientation="right"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(161, 161, 170, 0.4)', fontSize: 10 }}
                                    domain={[0, 'dataMax + 2']}
                                    hide
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    yAxisId="tps"
                                    type="monotone"
                                    dataKey="tps"
                                    name="TPS"
                                    stroke="#00D4AA"
                                    strokeWidth={2}
                                    fill="url(#tpsGradient)"
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#00D4AA', stroke: '#fff', strokeWidth: 2 }}
                                />
                                <Area
                                    yAxisId="nodes"
                                    type="monotone"
                                    dataKey="onlineCount"
                                    name="Online Nodes"
                                    stroke="#f59e0b"
                                    strokeWidth={1}
                                    strokeDasharray="4 4"
                                    fill="url(#nodesGradient)"
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
