'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { PNode } from '@/types/pnode';
import { Globe, MapPin } from 'lucide-react';

interface RegionalStatsProps {
    nodes: PNode[];
    isLoading: boolean;
}

interface RegionData {
    region: string;
    count: number;
    percentage: number;
    onlineCount: number;
}

// Map technical region names to friendly display names
function formatRegionName(region: string): string {
    const regionMap: Record<string, string> = {
        'us-east-1': '🇺🇸 US East (Virginia)',
        'us-east-2': '🇺🇸 US East (Ohio)',
        'us-west-1': '🇺🇸 US West (N. California)',
        'us-west-2': '🇺🇸 US West (Oregon)',
        'us-central-1': '🇺🇸 US Central (Chicago)',
        'eu-west-1': '🇮🇪 Europe (Ireland)',
        'eu-west-2': '🇬🇧 Europe (London)',
        'eu-central-1': '🇩🇪 Europe (Frankfurt)',
        'eu-north-1': '🇸🇪 Europe (Stockholm)',
        'ap-southeast-1': '🇸🇬 Asia Pacific (Singapore)',
        'ap-northeast-1': '🇯🇵 Asia Pacific (Tokyo)',
        'ap-northeast-2': '🇰🇷 Asia Pacific (Seoul)',
        'ap-south-1': '🇮🇳 Asia Pacific (Mumbai)',
        'ap-southeast-2': '🇦🇺 Asia Pacific (Sydney)',
    };

    return regionMap[region] || region || 'Unknown';
}

// Get continent from region for grouping
function getContinent(region: string): string {
    if (region.startsWith('us-')) return 'Americas';
    if (region.startsWith('eu-')) return 'Europe';
    if (region.startsWith('ap-')) return 'Asia Pacific';
    return 'Other';
}

export function RegionalStats({ nodes, isLoading }: RegionalStatsProps) {
    const { regionData, continentSummary } = useMemo(() => {
        const regionCounts = new Map<string, { total: number; online: number }>();

        for (const node of nodes) {
            const region = node.network.region || 'Unknown';
            const current = regionCounts.get(region) || { total: 0, online: 0 };
            current.total++;
            if (node.status === 'online') current.online++;
            regionCounts.set(region, current);
        }

        const total = nodes.length;
        const data: RegionData[] = Array.from(regionCounts.entries())
            .map(([region, counts]) => ({
                region,
                count: counts.total,
                onlineCount: counts.online,
                percentage: total > 0 ? Math.round((counts.total / total) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6); // Top 6 regions

        // Continent summary
        const continents = new Map<string, number>();
        for (const [region, counts] of regionCounts) {
            const continent = getContinent(region);
            continents.set(continent, (continents.get(continent) || 0) + counts.total);
        }

        return {
            regionData: data,
            continentSummary: Array.from(continents.entries())
                .map(([name, count]) => ({ name, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 }))
                .sort((a, b) => b.count - a.count),
        };
    }, [nodes]);

    const maxCount = regionData.length > 0 ? regionData[0].count : 1;

    return (
        <Card className="glass-card animate-fade-in-up animate-delay-5">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <Globe className="h-4 w-4 text-[#00D4AA]" />
                            Regional Distribution
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                            Nodes across {regionData.length} regions
                        </CardDescription>
                    </div>
                    {/* Continent pills */}
                    <div className="hidden sm:flex gap-1.5">
                        {continentSummary.slice(0, 3).map((c) => (
                            <div
                                key={c.name}
                                className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-muted-foreground"
                            >
                                {c.name}: {c.percentage}%
                            </div>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {isLoading ? (
                    <div className="h-[180px] flex items-center justify-center">
                        <div className="animate-pulse text-muted-foreground text-sm">
                            Loading regional data...
                        </div>
                    </div>
                ) : regionData.length === 0 ? (
                    <div className="h-[180px] flex items-center justify-center">
                        <div className="text-muted-foreground text-sm">
                            No regional data available
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {regionData.map((region, index) => (
                            <div key={region.region} className="group">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                        <span className="text-xs font-medium truncate">
                                            {formatRegionName(region.region)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="text-green-400">{region.onlineCount}↑</span>
                                        <span>{region.count} nodes</span>
                                    </div>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${(region.count / maxCount) * 100}%`,
                                            background: `linear-gradient(90deg, ${index === 0 ? '#00D4AA' :
                                                    index === 1 ? '#00B894' :
                                                        index === 2 ? '#6C5CE7' :
                                                            index === 3 ? '#74B9FF' :
                                                                index === 4 ? '#FDCB6E' : '#A29BFE'
                                                }, ${index === 0 ? '#00B894' :
                                                    index === 1 ? '#00A085' :
                                                        index === 2 ? '#5B4BD5' :
                                                            index === 3 ? '#5B9FE8' :
                                                                index === 4 ? '#E5B85C' : '#8B7FE8'
                                                })`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
