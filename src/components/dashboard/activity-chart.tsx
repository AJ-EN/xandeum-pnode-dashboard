'use client';

import { useMemo } from 'react';
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
import type { PNode } from '@/types/pnode';

interface ActivityChartProps {
    nodes: PNode[];
    isLoading: boolean;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name?: string;
        value?: number;
        color?: string;
    }>;
    label?: string;
}

interface DataPoint {
    time: string;
    hour: number;
    latency: number;
    throughput: number;
    nodes: number;
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
                        {entry.name === 'Latency' ? `${entry.value}ms` : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

/**
 * Generate simulated 24-hour activity data based on current node stats.
 * Since pNodes don't archive historical metrics, we simulate realistic patterns.
 */
function generateActivityData(nodes: PNode[]): DataPoint[] {
    const data: DataPoint[] = [];
    const currentHour = new Date().getHours();
    const onlineNodes = nodes.filter(n => n.status === 'online').length;

    // Base latency from current performance data
    const performingNodes = nodes.filter(n => n.performance?.avgLatencyMs);
    const baseLatency = performingNodes.length > 0
        ? performingNodes.reduce((sum, n) => sum + (n.performance?.avgLatencyMs || 0), 0) / performingNodes.length
        : 50;

    for (let i = 23; i >= 0; i--) {
        const hour = (currentHour - i + 24) % 24;
        const hourLabel = `${hour.toString().padStart(2, '0')}:00`;

        // Simulate realistic daily patterns
        // Peak hours: 10-14, 18-22 UTC (higher latency due to load)
        // Low hours: 2-6 UTC (lower latency)
        let loadMultiplier = 1;
        if (hour >= 10 && hour <= 14) loadMultiplier = 1.3;
        else if (hour >= 18 && hour <= 22) loadMultiplier = 1.4;
        else if (hour >= 2 && hour <= 6) loadMultiplier = 0.7;

        // Add some randomness for realism
        const variance = (Math.random() - 0.5) * 20;
        const latency = Math.max(10, Math.round(baseLatency * loadMultiplier + variance));

        // Throughput inversely related to latency  
        const throughput = Math.round((1000 / latency) * onlineNodes * (0.8 + Math.random() * 0.4));

        // Slight variation in node count (some may go offline/online)
        const nodeVariance = Math.floor((Math.random() - 0.5) * 3);
        const nodesAtHour = Math.max(0, onlineNodes + nodeVariance);

        data.push({
            time: hourLabel,
            hour,
            latency,
            throughput,
            nodes: nodesAtHour,
        });
    }

    return data;
}

export function ActivityChart({ nodes, isLoading }: ActivityChartProps) {
    const data = useMemo(() => generateActivityData(nodes), [nodes]);

    const avgLatency = data.length > 0
        ? Math.round(data.reduce((sum, d) => sum + d.latency, 0) / data.length)
        : 0;

    const currentLatency = data.length > 0 ? data[data.length - 1].latency : 0;

    return (
        <Card className="glass-card animate-fade-in-up animate-delay-4">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base font-medium">Network Activity</CardTitle>
                            <span
                                className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                title="pNodes don't archive historical metrics. This chart shows projected trends based on current network state."
                            >
                                SIMULATED
                            </span>
                        </div>
                        <CardDescription className="text-xs">
                            Projected 24h trends based on real-time snapshot
                        </CardDescription>
                    </div>
                    <div className="flex gap-4 text-right">
                        <div>
                            <p className="text-xs text-muted-foreground">Current</p>
                            <p className="text-lg font-semibold">{currentLatency}ms</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Projected Avg</p>
                            <p className="text-lg font-semibold text-muted-foreground">{avgLatency}ms</p>
                        </div>
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
                ) : (
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
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
                                    tickFormatter={(value) => value.split(':')[0]}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(161, 161, 170, 0.6)', fontSize: 10 }}
                                    tickFormatter={(value) => `${value}ms`}
                                    domain={['dataMin - 10', 'dataMax + 10']}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="latency"
                                    name="Latency"
                                    stroke="#00D4AA"
                                    strokeWidth={2}
                                    fill="url(#latencyGradient)"
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#00D4AA', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
