'use client';

import dynamic from 'next/dynamic';
import type { PNode } from '@/types/pnode';

interface MapWrapperProps {
    nodes: PNode[];
}

// Skeleton loader for the map
function MapSkeleton() {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
            {/* Header skeleton */}
            <div className="px-4 sm:px-6 py-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-white/5 rounded animate-pulse mt-1" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Map skeleton */}
            <div className="h-[400px] w-full bg-[#1a1a2e] relative overflow-hidden">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

                {/* Fake map elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-white/10 border-t-emerald-500 animate-spin" />
                        <p className="text-sm text-gray-500">Loading map...</p>
                    </div>
                </div>

                {/* Fake node dots */}
                <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-emerald-500/30 animate-pulse" />
                <div className="absolute top-1/3 left-1/2 w-3 h-3 rounded-full bg-emerald-500/30 animate-pulse" style={{ animationDelay: '200ms' }} />
                <div className="absolute top-1/2 left-3/4 w-3 h-3 rounded-full bg-emerald-500/30 animate-pulse" style={{ animationDelay: '400ms' }} />
                <div className="absolute top-2/3 left-1/3 w-3 h-3 rounded-full bg-emerald-500/30 animate-pulse" style={{ animationDelay: '600ms' }} />
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
