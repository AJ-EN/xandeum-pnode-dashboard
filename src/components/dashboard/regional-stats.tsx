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
    displayName: string;
    count: number;
    percentage: number;
    onlineCount: number;
}

// Mapping from GeoIP country/city to standardized country names
const COUNTRY_MAP: Record<string, string> = {
    // Technical AWS-style regions
    'us-east-1': '🇺🇸 United States',
    'us-east-2': '🇺🇸 United States',
    'us-west-1': '🇺🇸 United States',
    'us-west-2': '🇺🇸 United States',
    'us-central-1': '🇺🇸 United States',
    'eu-west-1': '🇮🇪 Ireland',
    'eu-west-2': '🇬🇧 United Kingdom',
    'eu-central-1': '🇩🇪 Germany',
    'eu-north-1': '🇸🇪 Sweden',
    'ap-southeast-1': '🇸🇬 Singapore',
    'ap-northeast-1': '🇯🇵 Japan',
    'ap-northeast-2': '🇰🇷 South Korea',
    'ap-south-1': '🇮🇳 India',
    'ap-southeast-2': '🇦🇺 Australia',
    // Common city/state to country mappings
    'texas': '🇺🇸 United States',
    'california': '🇺🇸 United States',
    'virginia': '🇺🇸 United States',
    'oregon': '🇺🇸 United States',
    'ohio': '🇺🇸 United States',
    'new york': '🇺🇸 United States',
    'florida': '🇺🇸 United States',
    'bucuresti': '🇷🇴 Romania',
    'bucharest': '🇷🇴 Romania',
    'london': '🇬🇧 United Kingdom',
    'frankfurt': '🇩🇪 Germany',
    'tokyo': '🇯🇵 Japan',
    'singapore': '🇸🇬 Singapore',
    'mumbai': '🇮🇳 India',
    'sydney': '🇦🇺 Australia',
    'seoul': '🇰🇷 South Korea',
    'amsterdam': '🇳🇱 Netherlands',
    'paris': '🇫🇷 France',
    'toronto': '🇨🇦 Canada',
    'montreal': '🇨🇦 Canada',
    'sao paulo': '🇧🇷 Brazil',
    'hong kong': '🇭🇰 Hong Kong',
    'dublin': '🇮🇪 Ireland',
    'stockholm': '🇸🇪 Sweden',
    'zurich': '🇨🇭 Switzerland',
};

// Standardize region name to country
function normalizeToCountry(region: string): string {
    if (!region) return '🌍 Unknown';

    const lower = region.toLowerCase().trim();

    // Check exact match first
    if (COUNTRY_MAP[lower]) return COUNTRY_MAP[lower];

    // Check if it contains a known key
    for (const [key, country] of Object.entries(COUNTRY_MAP)) {
        if (lower.includes(key)) return country;
    }

    // If it looks like a country already (has flag emoji), return as-is
    if (/[\u{1F1E6}-\u{1F1FF}]/u.test(region)) return region;

    // Default: capitalize first letter
    return `🌍 ${region.charAt(0).toUpperCase() + region.slice(1)}`;
}

export function RegionalStats({ nodes, isLoading }: RegionalStatsProps) {
    const { regionData, totalCountries } = useMemo(() => {
        // First pass: group by original region
        const rawCounts = new Map<string, { total: number; online: number }>();

        for (const node of nodes) {
            const region = node.network.region || 'Unknown';
            const current = rawCounts.get(region) || { total: 0, online: 0 };
            current.total++;
            if (node.status === 'online') current.online++;
            rawCounts.set(region, current);
        }

        // Second pass: group by country
        const countryCounts = new Map<string, { total: number; online: number }>();
        for (const [region, counts] of rawCounts) {
            const country = normalizeToCountry(region);
            const current = countryCounts.get(country) || { total: 0, online: 0 };
            current.total += counts.total;
            current.online += counts.online;
            countryCounts.set(country, current);
        }

        const total = nodes.length;
        const data: RegionData[] = Array.from(countryCounts.entries())
            .map(([displayName, counts]) => ({
                region: displayName,
                displayName,
                count: counts.total,
                onlineCount: counts.online,
                percentage: total > 0 ? Math.round((counts.total / total) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8); // Top 8 countries

        return {
            regionData: data,
            totalCountries: countryCounts.size,
        };
    }, [nodes]);

    const maxCount = regionData.length > 0 ? regionData[0].count : 1;

    // Color palette for bars
    const barColors = [
        '#00D4AA', '#00B894', '#6C5CE7', '#74B9FF',
        '#FDCB6E', '#A29BFE', '#E17055', '#55A3FF',
    ];

    return (
        <Card className="glass-card animate-fade-in-up animate-delay-5 h-[320px] flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <Globe className="h-4 w-4 text-[#00D4AA]" />
                            Regional Distribution
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                            {totalCountries} countr{totalCountries !== 1 ? 'ies' : 'y'} • {nodes.length} nodes
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden pt-0">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-pulse text-muted-foreground text-sm">
                            Loading regional data...
                        </div>
                    </div>
                ) : regionData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-muted-foreground text-sm">
                            No regional data available
                        </div>
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
                        {regionData.map((region, index) => (
                            <div key={region.displayName} className="group">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                        <span className="text-xs font-medium truncate">
                                            {region.displayName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="text-green-400">{region.onlineCount}↑</span>
                                        <span>{region.count}</span>
                                    </div>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${(region.count / maxCount) * 100}%`,
                                            backgroundColor: barColors[index % barColors.length],
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
