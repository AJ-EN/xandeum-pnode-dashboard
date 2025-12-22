'use client';

import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PNode } from '@/types/pnode';
import 'leaflet/dist/leaflet.css';

interface NetworkMapProps {
    nodes: PNode[];
    onNodeSelect: (node: PNode) => void;
}

// Component to fit map bounds to nodes
function FitBounds({ nodes }: { nodes: PNode[] }) {
    const map = useMap();

    useEffect(() => {
        const nodesWithGeo = nodes.filter(n => n.network.geo);
        if (nodesWithGeo.length === 0) return;

        const bounds = nodesWithGeo.map(n => [n.network.geo!.lat, n.network.geo!.lng] as [number, number]);

        // Only fit if we have multiple points, otherwise center on single point
        if (bounds.length > 1) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
        } else if (bounds.length === 1) {
            map.setView(bounds[0], 4);
        }
    }, [nodes, map]);

    return null;
}

function getMarkerColor(status: string): string {
    switch (status) {
        case 'online': return '#22c55e';
        case 'offline': return '#ef4444';
        case 'degraded':
        case 'syncing': return '#f59e0b';
        default: return '#71717a';
    }
}

function truncatePubkey(pubkey: string): string {
    return `${pubkey.slice(0, 6)}...${pubkey.slice(-4)}`;
}

export function NetworkMap({ nodes, onNodeSelect }: NetworkMapProps) {
    const nodesWithGeo = useMemo(
        () => nodes.filter(n => n.network.geo),
        [nodes]
    );

    // Count nodes by status
    const statusCounts = useMemo(() => {
        const counts = { online: 0, offline: 0, degraded: 0, syncing: 0 };
        nodesWithGeo.forEach(n => {
            if (n.status in counts) counts[n.status as keyof typeof counts]++;
        });
        return counts;
    }, [nodesWithGeo]);

    // Default center if no nodes with geo
    const defaultCenter: [number, number] = [20, 0];

    return (
        <Card className="glass-card animate-fade-in-up animate-delay-3 h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base font-medium">Global Distribution</CardTitle>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-muted-foreground">{statusCounts.online}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            <span className="text-muted-foreground">{statusCounts.degraded + statusCounts.syncing}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-muted-foreground">{statusCounts.offline}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="h-[300px] lg:h-[350px] rounded-lg overflow-hidden">
                    <MapContainer
                        center={defaultCenter}
                        zoom={2}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={true}
                        scrollWheelZoom={true}
                        attributionControl={true}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <FitBounds nodes={nodes} />

                        {nodesWithGeo.map((node) => (
                            <CircleMarker
                                key={node.pubkey}
                                center={[node.network.geo!.lat, node.network.geo!.lng]}
                                radius={node.status === 'online' ? 8 : 6}
                                pathOptions={{
                                    color: getMarkerColor(node.status),
                                    fillColor: getMarkerColor(node.status),
                                    fillOpacity: node.status === 'online' ? 0.8 : 0.5,
                                    weight: node.status === 'online' ? 2 : 1,
                                }}
                                eventHandlers={{
                                    click: () => onNodeSelect(node),
                                }}
                            >
                                <Popup>
                                    <div className="min-w-[180px] space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm">
                                                {node.operatorName || 'Unknown'}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs capitalize ${node.status === 'online' ? 'status-online' :
                                                        node.status === 'offline' ? 'status-offline' :
                                                            'status-degraded'
                                                    }`}
                                            >
                                                {node.status}
                                            </Badge>
                                        </div>
                                        <div className="text-xs space-y-1 text-muted-foreground">
                                            <div className="font-mono">{truncatePubkey(node.pubkey)}</div>
                                            {node.network.region && (
                                                <div>📍 {node.network.region}</div>
                                            )}
                                            {node.versionInfo?.version && (
                                                <div>📦 {node.versionInfo.version}</div>
                                            )}
                                            {node.healthScore !== undefined && (
                                                <div>❤️ Health: {node.healthScore}%</div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => onNodeSelect(node)}
                                            className="w-full text-xs text-center py-1.5 rounded bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
                                        >
                                            View Details →
                                        </button>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}
                    </MapContainer>
                </div>
            </CardContent>
        </Card>
    );
}
