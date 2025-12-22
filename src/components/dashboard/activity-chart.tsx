'use client';

import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';
import type { PNode } from '@/types/pnode';
import { Activity } from 'lucide-react';

interface ActivityChartProps {
    nodes: PNode[];
}

interface DataPoint {
    time: string;
    hour: number;
    latency: number;
}

/**
 * Generate 24 hours of mock historical data based on current node stats
 */
function generateHistoricalData(nodes: PNode[]): DataPoint[] {
    const data: DataPoint[] = [];
    const now = new Date();

    // Calculate current average latency
    const nodesWithLatency = nodes.filter(n => n.performance?.avgLatencyMs);
    const currentAvgLatency = nodesWithLatency.length > 0
        ? nodesWithLatency.reduce((sum, n) => sum + (n.performance?.avgLatencyMs ?? 0), 0) / nodesWithLatency.length
        : 50;

    for (let i = 23; i >= 0; i--) {
        const hourDate = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hour = hourDate.getHours();

        // Simulate realistic variations
        const isPeakHour = hour >= 9 && hour <= 18;
        const latencyVariation = (Math.random() - 0.5) * 0.3;
        const peakMultiplier = isPeakHour ? 1.15 : 1;
        const latency = Math.round(currentAvgLatency * peakMultiplier * (1 + latencyVariation));

        data.push({
            time: hourDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            hour,
            latency: Math.max(10, latency),
        });
    }

    return data;
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; name: string }>;
    label?: string;
}) {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-[#0c0c14]/95 border border-white/10 rounded-lg px-3 py-2 shadow-xl">
            <p className="text-[10px] text-white/40 mb-1">{label}</p>
            <p className="text-sm font-medium text-emerald-400">
                {payload[0].value}ms
            </p>
        </div>
    );
}

export function ActivityChart({ nodes }: ActivityChartProps) {
    const data = useMemo(() => generateHistoricalData(nodes), [nodes]);
    const currentLatency = data[data.length - 1]?.latency ?? 0;

    return (
        <div className="glass-card overflow-hidden">
            {/* Compact Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-medium text-white/80">Network Latency</h3>
                    <span className="px-1.5 py-0.5 text-[9px] font-medium text-amber-400/70 bg-amber-500/10 rounded">
                        24h
                    </span>
                </div>
                <span className="text-lg font-semibold text-emerald-400 tabular-nums">
                    {currentLatency}ms
                </span>
            </div>

            {/* Chart - reduced height */}
            <div className="h-[180px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.03)"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                            interval="preserveStartEnd"
                            minTickGap={80}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                            tickFormatter={(value) => `${value}`}
                            width={30}
                            domain={['dataMin - 10', 'dataMax + 20']}
                            tickCount={4}
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />

                        <Area
                            type="monotone"
                            dataKey="latency"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#latencyGradient)"
                            animationDuration={800}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
