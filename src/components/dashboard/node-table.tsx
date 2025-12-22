'use client';

import { useState, useMemo } from 'react';
import type { PNode, PNodeStatus } from '@/types/pnode';
import { NodeDetailSheet } from './node-detail-sheet';
import { Card } from '@/components/ui/card';
interface NodeTableProps {
    nodes: PNode[];
    isLoading?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Region flags mapping
// ─────────────────────────────────────────────────────────────────────────────

const REGION_FLAGS: Record<string, { flag: string; name: string }> = {
    'us-east-1': { flag: '🇺🇸', name: 'Virginia' },
    'us-east-2': { flag: '🇺🇸', name: 'Ohio' },
    'us-west-1': { flag: '🇺🇸', name: 'N. California' },
    'us-west-2': { flag: '🇺🇸', name: 'Oregon' },
    'us-central-1': { flag: '🇺🇸', name: 'Chicago' },
    'eu-west-1': { flag: '🇮🇪', name: 'Ireland' },
    'eu-west-2': { flag: '🇬🇧', name: 'London' },
    'eu-central-1': { flag: '🇩🇪', name: 'Frankfurt' },
    'eu-north-1': { flag: '🇸🇪', name: 'Stockholm' },
    'ap-southeast-1': { flag: '🇸🇬', name: 'Singapore' },
    'ap-northeast-1': { flag: '🇯🇵', name: 'Tokyo' },
    'ap-northeast-2': { flag: '🇰🇷', name: 'Seoul' },
    'ap-south-1': { flag: '🇮🇳', name: 'Mumbai' },
    'ap-southeast-2': { flag: '🇦🇺', name: 'Sydney' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper components
// ─────────────────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: PNodeStatus }) {
    const config: Record<PNodeStatus, { dot: string; glow: string; text: string }> = {
        online: {
            dot: 'bg-emerald-500',
            glow: 'glow-emerald',
            text: 'text-emerald-400',
        },
        offline: {
            dot: 'bg-red-500',
            glow: 'glow-red',
            text: 'text-red-400',
        },
        degraded: {
            dot: 'bg-amber-500',
            glow: 'glow-amber',
            text: 'text-amber-400',
        },
        syncing: {
            dot: 'bg-blue-500 animate-pulse',
            glow: 'glow-blue',
            text: 'text-blue-400',
        },
    };

    const c = config[status];

    return (
        <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${c.dot} ${c.glow}`} />
            <span className={`text-xs capitalize hidden sm:inline ${c.text}`}>
                {status}
            </span>
        </div>
    );
}

function TruncatedId({ pubkey, onClick }: { pubkey: string; onClick?: (e: React.MouseEvent) => void }) {
    const [copied, setCopied] = useState(false);

    const truncated = `${pubkey.slice(0, 6)}...${pubkey.slice(-4)}`;

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        try {
            await navigator.clipboard.writeText(pubkey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="flex items-center gap-2 group">
            <code className="text-xs sm:text-sm font-mono text-gray-300 bg-white/5 px-2 py-0.5 rounded">
                {truncated}
            </code>
            <button
                onClick={handleCopy}
                className={`
                    p-1 rounded transition-all duration-200
                    ${copied
                        ? 'text-emerald-400'
                        : 'text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100'
                    }
                `}
                title="Copy full ID"
            >
                {copied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                )}
            </button>
        </div>
    );
}

function RegionBadge({ region }: { region?: string }) {
    if (!region) {
        return <span className="text-gray-500 text-sm">Unknown</span>;
    }

    const info = REGION_FLAGS[region] || { flag: '🌐', name: region };

    return (
        <div className="flex items-center gap-1.5">
            <span className="text-base">{info.flag}</span>
            <span className="text-xs sm:text-sm text-gray-300 hidden sm:inline">{info.name}</span>
        </div>
    );
}

function LatencyBadge({ latency }: { latency?: number }) {
    if (latency === undefined) {
        return <span className="text-gray-500 text-sm">—</span>;
    }

    let colorClass = 'text-emerald-400 bg-emerald-500/10';
    if (latency > 100) colorClass = 'text-amber-400 bg-amber-500/10';
    if (latency > 200) colorClass = 'text-red-400 bg-red-500/10';

    return (
        <span className={`text-xs sm:text-sm px-2 py-0.5 rounded ${colorClass}`}>
            {latency}ms
        </span>
    );
}

function formatLastSeen(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter Components
// ─────────────────────────────────────────────────────────────────────────────

interface FilterBarProps {
    statusFilter: PNodeStatus | 'all';
    onStatusFilterChange: (status: PNodeStatus | 'all') => void;
    versionFilter: string;
    onVersionFilterChange: (version: string) => void;
    availableVersions: string[];
}

function FilterBar({
    statusFilter,
    onStatusFilterChange,
    versionFilter,
    onVersionFilterChange,
    availableVersions,
}: FilterBarProps) {
    return (
        <div className="flex flex-wrap gap-3 p-4 border-b border-white/10 bg-white/5">
            {/* Status Filter */}
            <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value as PNodeStatus | 'all')}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-purple-500/50 cursor-pointer"
            >
                <option value="all">All Status</option>
                <option value="online">🟢 Online</option>
                <option value="offline">🔴 Offline</option>
                <option value="degraded">🟡 Degraded</option>
                <option value="syncing">🔵 Syncing</option>
            </select>

            {/* Version Filter */}
            <select
                value={versionFilter}
                onChange={(e) => onVersionFilterChange(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-purple-500/50 cursor-pointer"
            >
                <option value="all">All Versions</option>
                {availableVersions.map((version) => (
                    <option key={version} value={version}>
                        {version}
                    </option>
                ))}
            </select>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

function TableSkeleton() {
    return (
        <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="h-14 bg-white/5 rounded-lg animate-pulse"
                    style={{ animationDelay: `${i * 100}ms` }}
                />
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters?: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="relative mb-6">
                {hasFilters ? (
                    <div className="w-20 h-20 rounded-full border-2 border-gray-600 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                ) : (
                    <>
                        <div className="absolute inset-0 animate-ping opacity-20">
                            <div className="w-20 h-20 rounded-full border-2 border-blue-500" />
                        </div>
                        <div className="w-20 h-20 rounded-full border-2 border-blue-500/50 flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                            </svg>
                        </div>
                    </>
                )}
            </div>

            <h3 className="text-lg font-semibold text-gray-200 mb-2">
                {hasFilters ? 'No matches found' : 'Waiting for Gossip...'}
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
                {hasFilters
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Scanning the network for active pNodes. This may take a moment.'}
            </p>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main table component
// ─────────────────────────────────────────────────────────────────────────────

export function NodeTable({ nodes, isLoading }: NodeTableProps) {
    const [selectedNode, setSelectedNode] = useState<PNode | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<PNodeStatus | 'all'>('all');
    const [versionFilter, setVersionFilter] = useState('all');

    // Get unique versions for filter dropdown
    const availableVersions = useMemo(() => {
        const versions = new Set<string>();
        nodes.forEach((node) => {
            if (node.versionInfo?.version) {
                versions.add(node.versionInfo.version);
            }
        });
        return Array.from(versions).sort();
    }, [nodes]);

    // Filter nodes based on status and version
    const filteredNodes = useMemo(() => {
        return nodes.filter((node) => {
            // Status filter
            if (statusFilter !== 'all' && node.status !== statusFilter) {
                return false;
            }

            // Version filter
            if (versionFilter !== 'all' && node.versionInfo?.version !== versionFilter) {
                return false;
            }

            return true;
        });
    }, [nodes, statusFilter, versionFilter]);

    const hasActiveFilters = statusFilter !== 'all' || versionFilter !== 'all';

    const handleRowClick = (node: PNode) => {
        setSelectedNode(node);
        setIsSheetOpen(true);
    };

    const handleCloseSheet = () => {
        setIsSheetOpen(false);
        // Delay clearing the node to allow animation to complete
        setTimeout(() => setSelectedNode(null), 300);
    };

    if (isLoading) {
        return (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                <TableSkeleton />
            </div>
        );
    }

    return (
        <>
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                {/* Filters */}
                <FilterBar
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    versionFilter={versionFilter}
                    onVersionFilterChange={setVersionFilter}
                    availableVersions={availableVersions}
                />

                {filteredNodes.length === 0 ? (
                    <EmptyState hasFilters={hasActiveFilters} />
                ) : (
                    <>
                        {/* Desktop table view */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10">
                                        <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                                            Status
                                        </th>
                                        <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                                            Node ID
                                        </th>
                                        <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                                            IP Address
                                        </th>
                                        <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                                            Version
                                        </th>
                                        <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                                            Latency
                                        </th>
                                        <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                                            Last Seen
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredNodes.map((node) => (
                                        <tr
                                            key={node.pubkey}
                                            onClick={() => handleRowClick(node)}
                                            className="hover:bg-white/10 cursor-pointer transition-colors duration-150"
                                        >
                                            <td className="px-4 py-3">
                                                <StatusDot status={node.status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <TruncatedId pubkey={node.pubkey} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <code className="text-sm text-gray-300 font-mono">
                                                    {node.network.host}
                                                </code>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-gray-300">
                                                    {node.versionInfo?.version || '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <LatencyBadge latency={node.performance?.avgLatencyMs} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-gray-400">
                                                    {formatLastSeen(node.lastSeenAt)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile card view */}
                        <div className="md:hidden divide-y divide-white/5">
                            {filteredNodes.map((node) => (
                                <div
                                    key={node.pubkey}
                                    onClick={() => handleRowClick(node)}
                                    className="p-4 hover:bg-white/10 cursor-pointer transition-colors duration-150"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <StatusDot status={node.status} />
                                            <TruncatedId pubkey={node.pubkey} />
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {formatLastSeen(node.lastSeenAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <code className="text-xs text-gray-400 font-mono">
                                            {node.network.host}
                                        </code>
                                        <span className="text-gray-500">•</span>
                                        <span className="text-gray-400">
                                            {node.versionInfo?.version || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Results count */}
                        <div className="px-4 py-2 border-t border-white/10 text-xs text-gray-500">
                            Showing {filteredNodes.length} of {nodes.length} nodes
                            {hasActiveFilters && ' (filtered)'}
                        </div>
                    </>
                )}
            </Card>

            {/* Node Detail Sheet */}
            <NodeDetailSheet
                node={selectedNode}
                isOpen={isSheetOpen}
                onClose={handleCloseSheet}
            />
        </>
    );
}
