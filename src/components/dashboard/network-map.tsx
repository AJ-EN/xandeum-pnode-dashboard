'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import type { PNode } from '@/types/pnode';
import { Globe } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface NetworkMapProps {
    nodes: PNode[];
}

export function NetworkMap({ nodes }: NetworkMapProps) {
    // Filter nodes that have geo coordinates
    const nodesWithGeo = nodes.filter(
        (node) => node.network.geo?.lat !== undefined && node.network.geo?.lng !== undefined
    );

    const regionCount = new Set(nodesWithGeo.map(n => n.network.region)).size;

    // Fix Leaflet icon issue in Next.js
    useEffect(() => {
        // Safety measure for Leaflet in Next.js
    }, []);

    return (
        <div className="glass-card overflow-hidden">
            {/* Compact Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-medium text-white/80">Global Distribution</h3>
                </div>
                <span className="text-xs text-white/40">
                    {nodesWithGeo.length} nodes • {regionCount} regions
                </span>
            </div>

            {/* Map Container - reduced height */}
            <div className="h-[220px] sm:h-[260px] w-full">
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    minZoom={1}
                    maxZoom={8}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                    style={{ background: '#080810' }}
                >
                    {/* Dark theme tile layer - CartoDB Dark Matter */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {/* Node markers */}
                    {nodesWithGeo.map((node) => {
                        const isOnline = node.status === 'online';
                        const isDegraded = node.status === 'degraded' || node.status === 'syncing';

                        return (
                            <CircleMarker
                                key={node.pubkey}
                                center={[node.network.geo!.lat, node.network.geo!.lng]}
                                radius={isOnline ? 6 : 5}
                                pathOptions={{
                                    color: isOnline ? '#10b981' : isDegraded ? '#f59e0b' : '#ef4444',
                                    fillColor: isOnline ? '#10b981' : isDegraded ? '#f59e0b' : '#ef4444',
                                    fillOpacity: 0.7,
                                    weight: 2,
                                    opacity: 0.9,
                                }}
                            >
                                <Popup className="dark-popup">
                                    <div className="min-w-[160px]">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                                            <span
                                                className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : isDegraded ? 'bg-amber-500' : 'bg-red-500'
                                                    }`}
                                            />
                                            <span className="text-xs font-medium uppercase text-white/60">
                                                {node.status}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div>
                                                <p className="text-[9px] text-white/40 uppercase">Node</p>
                                                <p className="font-mono text-[11px] text-white/80">
                                                    {node.pubkey.slice(0, 8)}...{node.pubkey.slice(-4)}
                                                </p>
                                            </div>

                                            {node.network.region && (
                                                <div>
                                                    <p className="text-[9px] text-white/40 uppercase">Region</p>
                                                    <p className="text-[11px] text-white/80">
                                                        {node.network.region}
                                                    </p>
                                                </div>
                                            )}

                                            {node.versionInfo?.version && (
                                                <div>
                                                    <p className="text-[9px] text-white/40 uppercase">Version</p>
                                                    <p className="text-[11px] text-white/80">
                                                        {node.versionInfo.version}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}
