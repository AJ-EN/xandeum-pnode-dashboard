'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { PNode } from '@/types/pnode';

// Dynamically import the map component with SSR disabled
// Leaflet requires window/document objects which aren't available during SSR
const NetworkMap = dynamic(
    () => import('./network-map').then(mod => mod.NetworkMap),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-zinc-900/50 rounded-xl">
                <div className="text-center space-y-3">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading map...</p>
                </div>
            </div>
        ),
    }
);

interface MapWrapperProps {
    nodes: PNode[];
    isLoading: boolean;
    onNodeSelect: (node: PNode) => void;
}

export function MapWrapper({ nodes, isLoading, onNodeSelect }: MapWrapperProps) {
    if (isLoading) {
        return (
            <div className="w-full h-full min-h-[300px] lg:min-h-[400px]">
                <Skeleton className="w-full h-full rounded-xl" />
            </div>
        );
    }

    return <NetworkMap nodes={nodes} onNodeSelect={onNodeSelect} />;
}
