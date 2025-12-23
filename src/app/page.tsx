'use client';

import { useState } from 'react';
import { usePNodes } from '@/hooks/use-pnodes';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { NodeTable } from '@/components/dashboard/node-table';
import { NodeDetailSheet } from '@/components/dashboard/node-detail-sheet';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { MapWrapper } from '@/components/dashboard/map-wrapper';
import { VersionChart } from '@/components/dashboard/version-chart';
import { RegionalStats } from '@/components/dashboard/regional-stats';
import { Button } from '@/components/ui/button';
import type { PNode } from '@/types/pnode';
import {
    RefreshCw,
    ExternalLink,
    Github,
} from 'lucide-react';

export default function Dashboard() {
    const { nodes, stats, isLoading, error, refetch, lastUpdated, dataSource } = usePNodes();
    const [selectedNode, setSelectedNode] = useState<PNode | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const handleNodeSelect = (node: PNode) => {
        setSelectedNode(node);
        setSheetOpen(true);
    };

    const handleRefresh = async () => {
        await refetch();
    };

    const formatLastUpdated = () => {
        if (!lastUpdated) return 'Never';
        const seconds = Math.floor((Date.now() - lastUpdated) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m ago`;
    };

    return (
        <>
            {/* Aurora Background */}
            <div className="aurora-bg" />

            <div className="min-h-screen">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo & Title */}
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#00B894] flex items-center justify-center">
                                        <span className="text-black font-bold text-lg">X</span>
                                    </div>
                                    <div className="absolute -inset-1 rounded-lg bg-[#00D4AA]/20 blur-md -z-10" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold tracking-tight">
                                        Xandeum Network Monitor
                                    </h1>
                                    <p className="text-xs text-muted-foreground hidden sm:block">
                                        pNode Analytics Dashboard
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                {/* Connection Status Indicator */}
                                {dataSource && (
                                    <div
                                        className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${dataSource === 'live'
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                            }`}
                                        title={dataSource === 'live' ? 'Connected to Xandeum pRPC' : 'Showing demo data'}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${dataSource === 'live' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                                        {dataSource === 'live' ? 'Live' : 'Demo'}
                                    </div>
                                )}
                                <span className="text-xs text-muted-foreground hidden md:block">
                                    Updated {formatLastUpdated()}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRefresh}
                                    disabled={isLoading}
                                    className="gap-2"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    <span className="hidden sm:inline">Refresh</span>
                                </Button>
                                <a
                                    href="https://xandeum.network"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                    title="Xandeum Website"
                                >
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </a>
                                <a
                                    href="https://github.com/AJ-EN/xandeum-pnode-dashboard"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                    title="GitHub Repository"
                                >
                                    <Github className="h-4 w-4 text-muted-foreground" />
                                </a>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                    {/* Error Banner */}
                    {error && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 animate-fade-in-up">
                            <p className="text-sm text-red-400">
                                ⚠️ {error}. Displaying mock data for demonstration.
                            </p>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <StatsGrid stats={stats} isLoading={isLoading} />

                    {/* Map & Chart Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <MapWrapper
                            nodes={nodes}
                            isLoading={isLoading}
                            onNodeSelect={handleNodeSelect}
                        />
                        <ActivityChart nodes={nodes} isLoading={isLoading} />
                    </div>

                    {/* Analytics Row: Version & Regional Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <VersionChart nodes={nodes} isLoading={isLoading} />
                        <RegionalStats nodes={nodes} isLoading={isLoading} />
                    </div>

                    {/* Node Table */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">pNode Directory</h2>
                        <NodeTable
                            nodes={nodes}
                            isLoading={isLoading}
                            onNodeSelect={handleNodeSelect}
                        />
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-white/5 bg-background/30 backdrop-blur-sm mt-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <span>Built with ❤️ by</span>
                                <a
                                    href="https://github.com/AJ-EN"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#00D4AA] hover:underline font-medium"
                                >
                                    AJ-EN
                                </a>
                                <span>for</span>
                                <a
                                    href="https://xandeum.network"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#00D4AA] hover:underline"
                                >
                                    Xandeum Superteam Bounty
                                </a>
                            </div>
                            <div className="flex items-center gap-4">
                                <a
                                    href="https://discord.gg/uqRSmmM5m"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Discord
                                </a>
                                <span>•</span>
                                <span>Data refreshes every 30s</span>
                            </div>
                        </div>
                    </div>
                </footer>

                {/* Node Detail Sheet */}
                <NodeDetailSheet
                    node={selectedNode}
                    open={sheetOpen}
                    onOpenChange={setSheetOpen}
                />
            </div>
        </>
    );
}
