'use client';

import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { PNode } from '@/types/pnode';

interface ActivityChartProps {
    nodes: PNode[];
}

interface DataPoint {
    time: string;
    hour: number;
    latency: number;
    activeNodes: number;
}

/**
 * Generate 24 hours of mock historical data based on current node stats
 */
function generateHistoricalData(nodes: PNode[]): DataPoint[] {
    const data: DataPoint[] = [];
    const now = new Date();
    const totalNodes = nodes.length;

    // Calculate current average latency
    const nodesWithLatency = nodes.filter(n => n.performance?.avgLatencyMs);
    const currentAvgLatency = nodesWithLatency.length > 0
        ? nodesWithLatency.reduce((sum, n) => sum + (n.performance?.avgLatencyMs ?? 0), 0) / nodesWithLatency.length
        : 50;

    // Calculate current active nodes
    const currentActiveNodes = nodes.filter(n => n.isActive).length;

    for (let i = 23; i >= 0; i--) {
        const hourDate = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hour = hourDate.getHours();

        // Simulate realistic variations
        // - More latency during peak hours (9-18)
        // - Fewer active nodes at night
        const isPeakHour = hour >= 9 && hour <= 18;
        const isNightHour = hour >= 0 && hour <= 6;

        // Latency varies ±30% with some peak hour increase
        const latencyVariation = (Math.random() - 0.5) * 0.3;
        const peakMultiplier = isPeakHour ? 1.15 : 1;
        const latency = Math.round(currentAvgLatency * peakMultiplier * (1 + latencyVariation));

        // Active nodes vary ±10%, less at night
        const nightReduction = isNightHour ? 0.85 : 1;
        const nodeVariation = (Math.random() - 0.5) * 0.1;
        const activeNodes = Math.round(currentActiveNodes * nightReduction * (1 + nodeVariation));

        data.push({
            time: hourDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            hour,
            latency: Math.max(10, latency),
            activeNodes: Math.max(0, Math.min(totalNodes, activeNodes)),
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
        <div className="bg-gray-900/95 border border-white/10 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            {payload.map((entry, index) => (
                <p key={index} className="text-sm font-medium text-emerald-400">
                    {entry.name}: {entry.value}{entry.name.includes('Latency') ? 'ms' : ''}
                </p>
            ))}
        </div>
    );
}

export function ActivityChart({ nodes }: ActivityChartProps) {
    const data = useMemo(() => generateHistoricalData(nodes), [nodes]);

    // Calculate current stats for display
    const currentLatency = data[data.length - 1]?.latency ?? 0;
    const currentActive = data[data.length - 1]?.activeNodes ?? 0;

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-200">
                            Network Activity
                        </h3>
                        <span className="px-1.5 py-0.5 text-[10px] font-medium text-amber-400/80 bg-amber-500/10 rounded border border-amber-500/20" title="Historical data is simulated for demonstration as pNode network does not archive metrics">
                            Simulated
                        </span>
                    </div>
                    <p className="text-xs text-gray-500">
                        Last 24 hours (projected)
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Avg Latency</p>
                        <p className="text-sm font-semibold text-emerald-400">
                            {currentLatency}ms
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Active</p>
                        <p className="text-sm font-semibold text-emerald-400">
                            {currentActive}
                        </p>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-[200px] sm:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                                <stop offset="50%" stopColor="#10b981" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#34d399" />
                                <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                        </defs>

                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 10 }}
                            interval="preserveStartEnd"
                            minTickGap={50}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 10 }}
                            tickFormatter={(value) => `${value}ms`}
                            width={45}
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{
                                stroke: '#374151',
                                strokeWidth: 1,
                                strokeDasharray: '4 4',
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="latency"
                            name="Avg Latency"
                            stroke="url(#lineGradient)"
                            strokeWidth={2}
                            fill="url(#latencyGradient)"
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
