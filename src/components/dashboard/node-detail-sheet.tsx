'use client';

import { useState } from 'react';
import type { PNode, PNodeStatus } from '@/types/pnode';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, Globe, Code, ChevronDown, ChevronRight } from 'lucide-react';

interface NodeDetailSheetProps {
    node: PNode | null;
    isOpen: boolean;
    onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────────────────────────────────────

function formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
}

function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
}

function StatusBadge({ status }: { status: PNodeStatus }) {
    const colors: Record<PNodeStatus, string> = {
        online: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        offline: 'bg-red-500/15 text-red-400 border-red-500/30',
        degraded: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        syncing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    };

    return (
        <Badge variant="outline" className={`${colors[status]} border font-semibold text-xs px-2 py-0.5`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}

function DataRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="flex items-start justify-between py-2 border-b border-white/[0.04] last:border-0">
            <span className="text-[11px] text-white/40 uppercase tracking-wide">{label}</span>
            <span className={`text-sm text-white/80 text-right ${mono ? 'font-mono text-xs' : ''}`}>
                {value || <span className="text-white/30">—</span>}
            </span>
        </div>
    );
}

function Section({
    title,
    icon,
    children,
    defaultOpen = true
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 w-full text-left py-1.5 hover:bg-white/[0.02] rounded transition-colors"
            >
                {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                )}
                {icon}
                <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">{title}</span>
            </button>
            {isOpen && (
                <div className="mt-2 bg-white/[0.02] rounded-lg px-3 ring-1 ring-white/[0.04]">
                    {children}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function NodeDetailSheet({ node, isOpen, onClose }: NodeDetailSheetProps) {
    const [showRawJson, setShowRawJson] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!node) return null;

    const handleCopyPubkey = async () => {
        try {
            await navigator.clipboard.writeText(node.pubkey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-[400px] bg-[#0a0a12]/98 backdrop-blur-xl border-l border-white/[0.06] overflow-y-auto p-0">
                {/* Header */}
                <div className="px-4 py-4 border-b border-white/[0.04]">
                    <SheetHeader className="pb-0">
                        <div className="flex items-center gap-2 mb-2">
                            <StatusBadge status={node.status} />
                            {node.isActive && (
                                <span className="text-[10px] text-white/40">Active</span>
                            )}
                        </div>
                        <SheetTitle className="flex items-center gap-2 text-left">
                            <code className="text-sm font-mono text-white/80 truncate">
                                {node.pubkey.slice(0, 10)}...{node.pubkey.slice(-6)}
                            </code>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopyPubkey}
                                className="h-6 w-6 p-0 hover:bg-white/5 shrink-0"
                            >
                                {copied ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                    <Copy className="w-3 h-3 text-white/40" />
                                )}
                            </Button>
                        </SheetTitle>
                    </SheetHeader>

                    {/* Health Score - Prominent */}
                    {node.healthScore !== undefined && (
                        <div className="mt-4 p-3 bg-white/[0.02] rounded-lg ring-1 ring-white/[0.04]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-white/40 uppercase tracking-wide">Health Score</span>
                                <span className={`text-lg font-bold ${node.healthScore >= 80 ? 'text-emerald-400' :
                                        node.healthScore >= 50 ? 'text-amber-400' : 'text-red-400'
                                    }`}>
                                    {node.healthScore}%
                                </span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${node.healthScore >= 80 ? 'bg-emerald-500' :
                                            node.healthScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${node.healthScore}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="px-4 py-4">
                    {/* Network Section - Primary */}
                    <Section
                        title="Network"
                        icon={<Globe className="w-3.5 h-3.5 text-cyan-400" />}
                        defaultOpen={true}
                    >
                        <DataRow label="IP Address" value={node.network.host} mono />
                        <DataRow label="Gossip Port" value={node.network.gossipPort} mono />
                        <DataRow label="RPC Port" value={node.network.prpcPort} mono />
                        <DataRow label="Region" value={node.network.region || 'Unknown'} />
                        {node.network.geo && (
                            <DataRow
                                label="Coordinates"
                                value={`${node.network.geo.lat.toFixed(4)}, ${node.network.geo.lng.toFixed(4)}`}
                                mono
                            />
                        )}
                    </Section>

                    {/* Software Section */}
                    <Section
                        title="Software"
                        icon={<Code className="w-3.5 h-3.5 text-purple-400" />}
                        defaultOpen={true}
                    >
                        <DataRow label="Version" value={node.versionInfo?.version} mono />
                        <DataRow label="Feature Set" value={node.versionInfo?.featureSet?.toString()} mono />
                        <DataRow label="Shred Version" value={node.versionInfo?.shredVersion?.toString()} mono />
                    </Section>

                    {/* Timestamps - Collapsed by default */}
                    <Section
                        title="Timestamps"
                        icon={<span className="w-3.5 h-3.5 text-amber-400">🕐</span>}
                        defaultOpen={false}
                    >
                        <DataRow
                            label="Last Seen"
                            value={formatRelativeTime(node.lastSeenAt)}
                        />
                        <DataRow
                            label="First Seen"
                            value={formatRelativeTime(node.firstSeenAt)}
                        />
                        <DataRow
                            label="Updated"
                            value={formatTimestamp(node.updatedAt)}
                        />
                    </Section>

                    {/* Raw JSON - Developer tool */}
                    <div className="mt-4">
                        <button
                            onClick={() => setShowRawJson(!showRawJson)}
                            className="flex items-center gap-2 text-[10px] font-medium text-white/40 hover:text-white/60 transition-colors"
                        >
                            {showRawJson ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            Raw JSON
                        </button>
                        {showRawJson && (
                            <div className="mt-2 bg-black/40 rounded-lg p-3 overflow-x-auto ring-1 ring-white/[0.04]">
                                <pre className="text-[10px] text-white/50 font-mono whitespace-pre-wrap break-all">
                                    {JSON.stringify(node, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
