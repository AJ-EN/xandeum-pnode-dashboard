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
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

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
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
}

function StatusBadge({ status }: { status: PNodeStatus }) {
    const variants: Record<PNodeStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        online: 'default',
        offline: 'destructive',
        degraded: 'secondary',
        syncing: 'outline',
    };

    const colors: Record<PNodeStatus, string> = {
        online: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30',
        offline: 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30',
        degraded: 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30',
        syncing: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30',
    };

    return (
        <Badge variant={variants[status]} className={colors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}

function DefinitionItem({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="py-3 border-b border-white/5 last:border-0">
            <dt className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</dt>
            <dd className={`text-sm text-foreground ${mono ? 'font-mono' : ''}`}>
                {value || <span className="text-muted-foreground">—</span>}
            </dd>
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
            <SheetContent className="w-full sm:max-w-[450px] bg-background/95 backdrop-blur-xl border-l border-white/10 overflow-y-auto">
                <SheetHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <StatusBadge status={node.status} />
                        {node.isActive && (
                            <span className="text-xs text-muted-foreground">Active in gossip</span>
                        )}
                    </div>
                    <SheetTitle className="flex items-center gap-2 text-left">
                        <code className="text-sm font-mono text-foreground truncate">
                            {node.pubkey.slice(0, 12)}...{node.pubkey.slice(-8)}
                        </code>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyPubkey}
                            className="h-8 w-8 p-0"
                        >
                            {copied ? (
                                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                        </Button>
                    </SheetTitle>
                </SheetHeader>

                <Separator className="my-4 bg-white/10" />

                {/* Content */}
                <div className="space-y-6">
                    {/* Network Section */}
                    <section>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            Network
                        </h3>
                        <div className="bg-white/5 rounded-lg px-4">
                            <DefinitionItem label="IP Address" value={node.network.host} mono />
                            <DefinitionItem label="Gossip Port" value={node.network.gossipPort} mono />
                            <DefinitionItem label="RPC Port" value={node.network.prpcPort} mono />
                            <DefinitionItem label="Region" value={node.network.region || 'Unknown'} />
                            {node.network.geo && (
                                <DefinitionItem
                                    label="Coordinates"
                                    value={`${node.network.geo.lat.toFixed(4)}, ${node.network.geo.lng.toFixed(4)}`}
                                    mono
                                />
                            )}
                        </div>
                    </section>

                    {/* Software Section */}
                    <section>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Software
                        </h3>
                        <div className="bg-white/5 rounded-lg px-4">
                            <DefinitionItem label="Version" value={node.versionInfo?.version} mono />
                            <DefinitionItem label="Feature Set" value={node.versionInfo?.featureSet?.toString()} mono />
                            <DefinitionItem label="Shred Version" value={node.versionInfo?.shredVersion?.toString()} mono />
                        </div>
                    </section>

                    {/* Health Section */}
                    {node.healthScore !== undefined && (
                        <section>
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Health
                            </h3>
                            <div className="bg-white/5 rounded-lg px-4">
                                <DefinitionItem
                                    label="Health Score"
                                    value={
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${node.healthScore >= 80 ? 'bg-emerald-500 glow-emerald' :
                                                        node.healthScore >= 50 ? 'bg-amber-500 glow-amber' : 'bg-red-500 glow-red'
                                                        }`}
                                                    style={{ width: `${node.healthScore}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold">{node.healthScore}%</span>
                                        </div>
                                    }
                                />
                            </div>
                        </section>
                    )}

                    {/* Timestamps Section */}
                    <section>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Timestamps
                        </h3>
                        <div className="bg-white/5 rounded-lg px-4">
                            <DefinitionItem
                                label="First Seen"
                                value={
                                    <div>
                                        <span>{formatRelativeTime(node.firstSeenAt)}</span>
                                        <span className="text-xs text-muted-foreground ml-2">({formatTimestamp(node.firstSeenAt)})</span>
                                    </div>
                                }
                            />
                            <DefinitionItem
                                label="Last Seen"
                                value={
                                    <div>
                                        <span>{formatRelativeTime(node.lastSeenAt)}</span>
                                        <span className="text-xs text-muted-foreground ml-2">({formatTimestamp(node.lastSeenAt)})</span>
                                    </div>
                                }
                            />
                            <DefinitionItem
                                label="Last Updated"
                                value={formatTimestamp(node.updatedAt)}
                            />
                        </div>
                    </section>

                    {/* Raw JSON Section */}
                    <section>
                        <details
                            open={showRawJson}
                            onToggle={(e) => setShowRawJson((e.target as HTMLDetailsElement).open)}
                        >
                            <summary className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 cursor-pointer hover:text-foreground transition-colors flex items-center gap-2">
                                <svg className={`w-4 h-4 transition-transform ${showRawJson ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Raw JSON (Developer)
                            </summary>
                            <div className="bg-black/50 rounded-lg p-4 overflow-x-auto border border-white/5">
                                <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-all">
                                    {JSON.stringify(node, null, 2)}
                                </pre>
                            </div>
                        </details>
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    );
}
