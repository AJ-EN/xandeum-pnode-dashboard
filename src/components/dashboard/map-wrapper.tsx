'use client';

import dynamic from 'next/dynamic';
import type { PNode } from '@/types/pnode';
import { Globe } from 'lucide-react';

interface MapWrapperProps {
    nodes: PNode[];
}

// Skeleton loader for the map
function MapSkeleton() {
    return (
        <div className="glass-card overflow-hidden">
            {/* Header skeleton */}
            <div className="px-5 sm:px-6 py-4 border-b border-white/[0.04]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
                            <Globe className="w-4 h-4 text-cyan-400/50" />
                        </div>
                        <div>
                            <div className="h-4 w-32 bg-white/10 rounded-md mb-1.5 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                            </div>
                            <div className="h-3 w-24 bg-white/5 rounded-md overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ animationDelay: '150ms' }} />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-12 bg-emerald-500/10 rounded-full ring-1 ring-emerald-500/20" />
                        <div className="h-6 w-12 bg-red-500/10 rounded-full ring-1 ring-red-500/20" />
                    </div>
                </div>
            </div>

            {/* Map skeleton */}
            <div className="h-[350px] sm:h-[400px] w-full bg-[#080810] relative overflow-hidden">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer" />

                {/* Centered loading indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-10 h-10 mx-auto mb-3 rounded-full border-2 border-white/10 border-t-emerald-500/60 animate-spin" />
                        <p className="text-xs text-white/30 font-medium">Loading map...</p>
                    </div>
                </div>

                {/* Decorative dots */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-emerald-500/20 animate-pulse" />
                <div className="absolute top-1/3 left-1/2 w-2 h-2 rounded-full bg-emerald-500/20 animate-pulse" style={{ animationDelay: '200ms' }} />
                <div className="absolute top-1/2 left-3/4 w-2 h-2 rounded-full bg-emerald-500/20 animate-pulse" style={{ animationDelay: '400ms' }} />
                <div className="absolute top-2/3 left-1/3 w-2 h-2 rounded-full bg-emerald-500/20 animate-pulse" style={{ animationDelay: '600ms' }} />
            </div>
        </div>
    );
}

// Dynamically import the NetworkMap component with SSR disabled
const NetworkMap = dynamic(
    () => import('./network-map').then((mod) => mod.NetworkMap),
    {
        ssr: false,
        loading: () => <MapSkeleton />,
    }
);

/**
 * Client-only wrapper for the NetworkMap component.
 * This is necessary because Leaflet doesn't work with SSR.
 */
export function MapWrapper({ nodes }: MapWrapperProps) {
    return <NetworkMap nodes={nodes} />;
}
