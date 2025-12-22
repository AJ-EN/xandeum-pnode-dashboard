'use client';

import { usePNodes } from '@/hooks/use-pnodes';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { NodeTable } from '@/components/dashboard/node-table';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { MapWrapper } from '@/components/dashboard/map-wrapper';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap } from 'lucide-react';

export default function Home() {
    const { nodes, stats, isLoading, error, refetch, lastUpdated } = usePNodes();

    return (
        <main className="dark min-h-screen pb-8">
            {/* Header - Compact */}
            <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Logo */}
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                                    Xandeum Network
                                </h1>
                                <p className="text-[11px] text-white/40 hidden sm:block">
                                    pNode Analytics
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Live indicator - subtle */}
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">Live</span>
                            </div>

                            {/* Refresh button */}
                            <Button
                                onClick={() => refetch()}
                                disabled={isLoading}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-white/5"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 text-white/50 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Error banner */}
                {error && (
                    <div className="glass-card p-4 flex items-start gap-3 border-red-500/20">
                        <div className="p-2 rounded-lg bg-red-500/10">
                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-red-200/80 mb-2">{error}</p>
                            <button
                                onClick={() => refetch()}
                                className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Bar - Hero stat + secondary metrics */}
                <StatsGrid stats={stats} isLoading={isLoading} />

                {/* Node Table - PRIMARY content (moved up from bottom) */}
                <NodeTable nodes={nodes} isLoading={isLoading} />

                {/* Visualizations - SECONDARY content (moved down) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ActivityChart nodes={nodes} />
                    <MapWrapper nodes={nodes} />
                </div>
            </div>

            {/* Footer - Minimal */}
            <footer className="border-t border-white/[0.04] mt-8">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between text-[10px] text-white/30">
                        <span>v1.0.0</span>
                        <span>Synced {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '--:--'}</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}
