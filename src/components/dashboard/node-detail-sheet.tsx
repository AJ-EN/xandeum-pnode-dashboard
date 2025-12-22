'use client';

import { useState } from 'react';
import type { PNode, PNodeStatus } from '@/types/pnode';

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
    const styles: Record<PNodeStatus, string> = {
        online: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        offline: 'bg-red-500/20 text-red-400 border-red-500/30',
        degraded: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        syncing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };

    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

function DefinitionItem({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="py-3 border-b border-white/5 last:border-0">
            <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</dt>
            <dd className={`text-sm text-gray-200 ${mono ? 'font-mono' : ''}`}>
                {value || <span className="text-gray-600">—</span>}
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
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className={`fixed right-0 top-0 h-full w-full sm:w-[450px] bg-[#0f0f0f] border-l border-white/10 z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="sticky top-0 bg-[#0f0f0f]/95 backdrop-blur-xl border-b border-white/10 p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <StatusBadge status={node.status} />
                                {node.isActive && (
                                    <span className="text-xs text-gray-500">Active in gossip</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="text-sm font-mono text-gray-300 truncate">
                                    {node.pubkey.slice(0, 12)}...{node.pubkey.slice(-8)}
                                </code>
                                <button
                                    onClick={handleCopyPubkey}
                                    className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                                    title="Copy full pubkey"
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
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto h-[calc(100%-80px)] p-4 space-y-6">
                    {/* Network Section */}
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
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
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
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
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Health
                            </h3>
                            <div className="bg-white/5 rounded-lg px-4">
                                <DefinitionItem
                                    label="Health Score"
                                    value={
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${node.healthScore >= 80 ? 'bg-emerald-500' :
                                                            node.healthScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${node.healthScore}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">{node.healthScore}%</span>
                                        </div>
                                    }
                                />
                            </div>
                        </section>
                    )}

                    {/* Timestamps Section */}
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
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
                                        <span className="text-xs text-gray-500 ml-2">({formatTimestamp(node.firstSeenAt)})</span>
                                    </div>
                                }
                            />
                            <DefinitionItem
                                label="Last Seen"
                                value={
                                    <div>
                                        <span>{formatRelativeTime(node.lastSeenAt)}</span>
                                        <span className="text-xs text-gray-500 ml-2">({formatTimestamp(node.lastSeenAt)})</span>
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
                            <summary className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 cursor-pointer hover:text-gray-300 transition-colors flex items-center gap-2">
                                <svg className={`w-4 h-4 transition-transform ${showRawJson ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Raw JSON (Developer)
                            </summary>
                            <div className="bg-black/50 rounded-lg p-4 overflow-x-auto">
                                <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap break-all">
                                    {JSON.stringify(node, null, 2)}
                                </pre>
                            </div>
                        </details>
                    </section>
                </div>
            </div>
        </>
    );
}
