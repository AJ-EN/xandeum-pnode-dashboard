'use client';

import { usePNodes } from '@/hooks/use-pnodes';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { NodeTable } from '@/components/dashboard/node-table';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { MapWrapper } from '@/components/dashboard/map-wrapper';

export default function Home() {
    const { nodes, stats, isLoading, error, refetch, lastUpdated } = usePNodes();

    return (
        <main className="min-h-screen bg-[#0b0b0b]">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0b0b]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Logo / Title */}
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-white">
                                    Xandeum Network Monitor
                                </h1>
                                <p className="text-xs text-gray-500 hidden sm:block">
                                    Real-time pNode analytics dashboard
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Last updated indicator */}
                            {lastUpdated && (
                                <span className="text-xs text-gray-500 hidden sm:block">
                                    Updated {new Date(lastUpdated).toLocaleTimeString()}
                                </span>
                            )}

                            {/* Refresh button */}
                            <button
                                onClick={() => refetch()}
                                disabled={isLoading}
                                className={`
                                    flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg
                                    bg-white/10 hover:bg-white/15 border border-white/10
                                    text-sm font-medium text-gray-200
                                    transition-all duration-200
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                <svg
                                    className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Error banner */}
                {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-xl p-4 flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-sm font-medium text-red-400">
                                Failed to fetch network data
                            </h3>
                            <p className="text-xs text-red-300/70 mt-1">
                                {error}
                            </p>
                            <button
                                onClick={() => refetch()}
                                className="text-xs text-red-400 hover:text-red-300 underline mt-2"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <section>
                    <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                        Network Overview
                    </h2>
                    <StatsGrid stats={stats} isLoading={isLoading} />
                </section>

                {/* Visualizations - Chart and Map */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ActivityChart nodes={nodes} />
                    <MapWrapper nodes={nodes} />
                </section>

                {/* Node Table */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                            Active Nodes
                        </h2>
                        <span className="text-xs text-gray-500">
                            {nodes.length} nodes
                        </span>
                    </div>
                    <NodeTable nodes={nodes} isLoading={isLoading} />
                </section>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/5 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                        <p>
                            Powered by{' '}
                            <a
                                href="https://xandeum.network"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                Xandeum Network
                            </a>
                        </p>
                        <p>
                            Auto-refreshes every 30 seconds
                        </p>
                    </div>
                </div>
            </footer>
        </main>
    );
}
