'use client';

import { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { PNode } from '@/types/pnode';

interface VersionChartProps {
    nodes: PNode[];
    isLoading: boolean;
}

// Xandeum-themed color palette
const COLORS = [
    '#00D4AA', // Primary teal
    '#00B894', // Darker teal
    '#6C5CE7', // Purple
    '#A29BFE', // Light purple
    '#FDCB6E', // Yellow
    '#E17055', // Coral
    '#74B9FF', // Light blue
    '#55A3FF', // Blue
];

interface VersionData {
    name: string;
    count: number;
    percentage: number;
    [key: string]: string | number; // Index signature for recharts
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name?: string;
        value?: number;
        payload?: VersionData;
    }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    if (!data) return null;

    return (
        <div className="bg-zinc-900/95 border border-white/10 rounded-lg p-3 shadow-xl backdrop-blur-sm">
            <p className="text-sm font-medium text-foreground">{data.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
                {data.count} nodes ({data.percentage}%)
            </p>
        </div>
    );
}

export function VersionChart({ nodes, isLoading }: VersionChartProps) {
    const versionData = useMemo(() => {
        const versionCounts = new Map<string, number>();

        for (const node of nodes) {
            const version = node.versionInfo?.version || 'Unknown';
            // Simplify version string for grouping
            const simpleVersion = version.split('-')[0] || version;
            versionCounts.set(simpleVersion, (versionCounts.get(simpleVersion) || 0) + 1);
        }

        const total = nodes.length;
        const data: VersionData[] = Array.from(versionCounts.entries())
            .map(([name, count]) => ({
                name,
                count,
                percentage: total > 0 ? Math.round((count / total) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8); // Limit to top 8 versions

        return data;
    }, [nodes]);

    const uniqueVersions = versionData.length;

    return (
        <Card className="glass-card animate-fade-in-up animate-delay-5">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Version Distribution</CardTitle>
                <CardDescription className="text-xs">
                    {uniqueVersions} unique version{uniqueVersions !== 1 ? 's' : ''} across {nodes.length} nodes
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
                {isLoading ? (
                    <div className="h-[200px] flex items-center justify-center">
                        <div className="animate-pulse text-muted-foreground text-sm">
                            Loading version data...
                        </div>
                    </div>
                ) : versionData.length === 0 ? (
                    <div className="h-[200px] flex items-center justify-center">
                        <div className="text-muted-foreground text-sm">
                            No version data available
                        </div>
                    </div>
                ) : (
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={versionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="count"
                                    nameKey="name"
                                >
                                    {versionData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            stroke="rgba(0,0,0,0.3)"
                                            strokeWidth={1}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    layout="vertical"
                                    align="right"
                                    verticalAlign="middle"
                                    iconSize={8}
                                    iconType="circle"
                                    formatter={(value: string) => (
                                        <span className="text-xs text-muted-foreground">{value}</span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
