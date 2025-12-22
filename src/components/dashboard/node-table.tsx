'use client';

import { useState, useMemo } from 'react';
import type { PNode, PNodeStatus } from '@/types/pnode';
import { NodeDetailSheet } from './node-detail-sheet';
import { Card } from '@/components/ui/card';
import { Copy, Check, Filter, ChevronRight } from 'lucide-react';

interface NodeTableProps {
    nodes: PNode[];
    isLoading?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper components
// ─────────────────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: PNodeStatus }) {
    const config: Record<PNodeStatus, { dot: string; glow: string }> = {
        online: {
            dot: 'bg-emerald-500',
            glow: 'shadow-[0_0_8px_rgba(16,185,129,0.6)]',
        },
        offline: {
            dot: 'bg-red-500',
            glow: 'shadow-[0_0_8px_rgba(239,68,68,0.6)]',
        },
        degraded: {
            dot: 'bg-amber-500',
            glow: 'shadow-[0_0_8px_rgba(245,158,11,0.6)]',
        },
        syncing: {
            dot: 'bg-blue-500 animate-pulse',
            glow: 'shadow-[0_0_8px_rgba(59,130,246,0.6)]',
        },
    };

    const c = config[status];

    return (
        <span
            className={`w-2.5 h-2.5 rounded-full ${c.dot} ${c.glow}`}
            title={status}
        />
    );
}

function TruncatedId({ pubkey }: { pubkey: string }) {
    const [copied, setCopied] = useState(false);

    const truncated = `${pubkey.slice(0, 6)}...${pubkey.slice(-4)}`;

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(pubkey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="flex items-center gap-1.5 group/id">
            <code className="text-xs font-mono text-white/80">
                {truncated}
            </code>
            <button
                onClick={handleCopy}
                className={`p-0.5 rounded transition-all duration-150 ${copied
                        ? 'text-emerald-400'
                        : 'text-white/20 hover:text-white/50 opacity-0 group-hover/id:opacity-100'
                    }`}
                title="Copy full ID"
            >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
        </div>
    );
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
    filteredCount: number;
    totalCount: number;
}

function FilterBar({
    statusFilter,
    onStatusFilterChange,
    versionFilter,
    onVersionFilterChange,
    availableVersions,
    filteredCount,
    totalCount,
}: FilterBarProps) {
    const hasFilters = statusFilter !== 'all' || versionFilter !== 'all';

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.04] bg-white/[0.01]">
            <div className="flex items-center gap-3">
                <Filter className="w-3.5 h-3.5 text-white/30" />

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value as PNodeStatus | 'all')}
                    className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-md text-xs text-white/70 focus:outline-none focus:border-emerald-500/40 cursor-pointer hover:bg-white/[0.06] transition-colors"
                >
                    <option value="all">All Status</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="degraded">Degraded</option>
                    <option value="syncing">Syncing</option>
                </select>

                {/* Version Filter */}
                <select
                    value={versionFilter}
                    onChange={(e) => onVersionFilterChange(e.target.value)}
                    className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-md text-xs text-white/70 focus:outline-none focus:border-emerald-500/40 cursor-pointer hover:bg-white/[0.06] transition-colors"
                >
                    <option value="all">All Versions</option>
                    {availableVersions.map((version) => (
                        <option key={version} value={version}>
                            {version}
                        </option>
                    ))}
                </select>
            </div>

            {/* Count */}
            <span className="text-[11px] text-white/40">
                {filteredCount} of {totalCount}
                {hasFilters && <span className="text-emerald-400/60 ml-1">(filtered)</span>}
            </span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

function TableSkeleton() {
    return (
        <div className="p-5 space-y-3">
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className="h-14 bg-white/[0.02] rounded-lg animate-pulse"
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
        <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
            </div>
            <p className="text-sm text-white/50 mb-1">
                {hasFilters ? 'No matches found' : 'No nodes detected'}
            </p>
            <p className="text-xs text-white/30">
                {hasFilters ? 'Try adjusting filters' : 'Scanning network...'}
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
            if (statusFilter !== 'all' && node.status !== statusFilter) {
                return false;
            }
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
        setTimeout(() => setSelectedNode(null), 300);
    };

    if (isLoading) {
        return (
            <Card className="glass-card overflow-hidden">
                <TableSkeleton />
            </Card>
        );
    }

    return (
        <>
            <Card className="glass-card overflow-hidden">
                {/* Filters */}
                <FilterBar
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    versionFilter={versionFilter}
                    onVersionFilterChange={setVersionFilter}
                    availableVersions={availableVersions}
                    filteredCount={filteredNodes.length}
                    totalCount={nodes.length}
                />

                {filteredNodes.length === 0 ? (
                    <EmptyState hasFilters={hasActiveFilters} />
                ) : (
                    <>
                        {/* Desktop table view */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/[0.04]">
                                        <th className="w-12 px-5 py-3"></th>
                                        <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                                            Node
                                        </th>
                                        <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                                            Location
                                        </th>
                                        <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                                            Version
                                        </th>
                                        <th className="w-10 px-5 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.05]">
                                    {filteredNodes.map((node) => (
                                        <tr
                                            key={node.pubkey}
                                            onClick={() => handleRowClick(node)}
                                            className="hover:bg-white/[0.02] cursor-pointer transition-colors duration-100 group"
                                        >
                                            <td className="px-5 py-4">
                                                <StatusDot status={node.status} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <TruncatedId pubkey={node.pubkey} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col">
                                                    <code className="text-xs font-mono text-white/60">
                                                        {node.network.host}
                                                    </code>
                                                    {node.network.region && (
                                                        <span className="text-[10px] text-white/35">
                                                            {node.network.region}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-xs text-white/50">
                                                    {node.versionInfo?.version || '—'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile card view */}
                        <div className="md:hidden divide-y divide-white/[0.04]">
                            {filteredNodes.map((node) => (
                                <div
                                    key={node.pubkey}
                                    onClick={() => handleRowClick(node)}
                                    className="px-5 py-4 hover:bg-white/[0.02] cursor-pointer transition-colors active:bg-white/[0.04]"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2.5">
                                            <StatusDot status={node.status} />
                                            <TruncatedId pubkey={node.pubkey} />
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-white/20" />
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-white/40 pl-5">
                                        <span>{node.network.host}</span>
                                        <span className="text-white/20">•</span>
                                        <span>{node.versionInfo?.version || 'Unknown'}</span>
                                    </div>
                                </div>
                            ))}
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
