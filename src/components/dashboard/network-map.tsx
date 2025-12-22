'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import type { PNode } from '@/types/pnode';
import 'leaflet/dist/leaflet.css';

interface NetworkMapProps {
    nodes: PNode[];
}

// Region display names
const REGION_NAMES: Record<string, string> = {
    'us-east-1': 'Virginia, USA',
    'us-east-2': 'Ohio, USA',
    'us-west-1': 'N. California, USA',
    'us-west-2': 'Oregon, USA',
    'us-central-1': 'Chicago, USA',
    'eu-west-1': 'Ireland',
    'eu-west-2': 'London, UK',
    'eu-central-1': 'Frankfurt, Germany',
    'eu-north-1': 'Stockholm, Sweden',
    'ap-southeast-1': 'Singapore',
    'ap-northeast-1': 'Tokyo, Japan',
    'ap-northeast-2': 'Seoul, South Korea',
    'ap-south-1': 'Mumbai, India',
    'ap-southeast-2': 'Sydney, Australia',
};

export function NetworkMap({ nodes }: NetworkMapProps) {
    // Filter nodes that have geo coordinates
    const nodesWithGeo = nodes.filter(
        (node) => node.network.geo?.lat !== undefined && node.network.geo?.lng !== undefined
    );

    // Fix Leaflet icon issue in Next.js
    useEffect(() => {
        // This is needed because Leaflet's default icon paths are broken in Next.js
        // We're using CircleMarkers instead of default markers, so this is just a safety measure
    }, []);

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-200">
                            Global Distribution
                        </h3>
                        <p className="text-xs text-gray-500">
                            {nodesWithGeo.length} nodes across {new Set(nodesWithGeo.map(n => n.network.region)).size} regions
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-gray-400">Online</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span className="text-gray-400">Offline</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="h-[400px] w-full">
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    minZoom={2}
                    maxZoom={8}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                    style={{ background: '#1a1a2e' }}
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
                                radius={isOnline ? 8 : 6}
                                pathOptions={{
                                    color: isOnline ? '#10b981' : isDegraded ? '#f59e0b' : '#ef4444',
                                    fillColor: isOnline ? '#10b981' : isDegraded ? '#f59e0b' : '#ef4444',
                                    fillOpacity: 0.7,
                                    weight: 2,
                                    opacity: 0.9,
                                }}
                            >
                                <Popup className="dark-popup">
                                    <div className="min-w-[180px]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span
                                                className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : isDegraded ? 'bg-amber-500' : 'bg-red-500'
                                                    }`}
                                            />
                                            <span className="text-xs font-medium uppercase text-gray-600">
                                                {node.status}
                                            </span>
                                        </div>

                                        <p className="text-xs text-gray-500 mb-1">Node ID</p>
                                        <p className="font-mono text-sm text-gray-800 mb-3">
                                            {node.pubkey.slice(0, 8)}...{node.pubkey.slice(-6)}
                                        </p>

                                        <p className="text-xs text-gray-500 mb-1">Region</p>
                                        <p className="text-sm text-gray-800">
                                            {REGION_NAMES[node.network.region ?? ''] || node.network.region || 'Unknown'}
                                        </p>

                                        {node.versionInfo?.version && (
                                            <>
                                                <p className="text-xs text-gray-500 mb-1 mt-2">Version</p>
                                                <p className="text-sm text-gray-800">
                                                    {node.versionInfo.version}
                                                </p>
                                            </>
                                        )}

                                        {node.performance?.avgLatencyMs && (
                                            <>
                                                <p className="text-xs text-gray-500 mb-1 mt-2">Latency</p>
                                                <p className="text-sm text-gray-800">
                                                    {node.performance.avgLatencyMs}ms
                                                </p>
                                            </>
                                        )}
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
