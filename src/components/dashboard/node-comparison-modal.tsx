'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useComparison } from '@/context/comparison-context';
import type { PNode } from '@/types/pnode';
import { X, MapPin, Server, Coins, Activity } from 'lucide-react';

interface NodeComparisonModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function formatBytes(bytes: number): string {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatStake(lamports: number): string {
    if (!lamports) return 'N/A';
    const xand = lamports / 1e9;
    if (xand >= 1e6) return `${(xand / 1e6).toFixed(2)}M`;
    if (xand >= 1e3) return `${(xand / 1e3).toFixed(1)}K`;
    return xand.toFixed(0);
}

function truncatePubkey(pubkey: string): string {
    return `${pubkey.slice(0, 6)}...${pubkey.slice(-4)}`;
}

interface ComparisonRowProps {
    label: string;
    icon?: React.ReactNode;
    nodes: PNode[];
    getValue: (node: PNode) => React.ReactNode;
    highlight?: 'max' | 'min';
}

function ComparisonRow({ label, icon, nodes, getValue, highlight }: ComparisonRowProps) {
    // Find best value for highlighting
    const numericValues = nodes.map((node) => {
        const val = getValue(node);
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            const num = parseFloat(val.replace(/[^0-9.-]/g, ''));
            return isNaN(num) ? null : num;
        }
        return null;
    });

    const validValues = numericValues.filter((v): v is number => v !== null);
    const bestIndex = validValues.length > 0
        ? highlight === 'min'
            ? numericValues.indexOf(Math.min(...validValues))
            : numericValues.indexOf(Math.max(...validValues))
        : -1;

    return (
        <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${nodes.length}, 1fr)` }}>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {icon}
                {label}
            </div>
            {nodes.map((node, i) => (
                <div
                    key={node.pubkey}
                    className={`text-sm font-medium ${i === bestIndex && highlight ? 'text-green-400' : ''
                        }`}
                >
                    {getValue(node)}
                </div>
            ))}
        </div>
    );
}

export function NodeComparisonModal({ open, onOpenChange }: NodeComparisonModalProps) {
    const { selectedNodes, clearAll, toggleNode } = useComparison();

    if (selectedNodes.length === 0) return null;

    const handleClose = () => {
        onOpenChange(false);
    };

    const handleClearAndClose = () => {
        clearAll();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Node Comparison
                        <Badge variant="secondary">{selectedNodes.length} nodes</Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Side-by-side comparison of selected nodes
                    </DialogDescription>
                </DialogHeader>

                {/* Node Headers */}
                <div
                    className="grid gap-2 mb-4"
                    style={{ gridTemplateColumns: `120px repeat(${selectedNodes.length}, 1fr)` }}
                >
                    <div />
                    {selectedNodes.map((node) => (
                        <div
                            key={node.pubkey}
                            className="p-3 rounded-lg border border-white/10 bg-white/[0.02] relative group"
                        >
                            <button
                                onClick={() => toggleNode(node.pubkey, node)}
                                className="absolute top-2 right-2 p-1 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                                title="Remove from comparison"
                            >
                                <X className="h-3 w-3" />
                            </button>
                            <div className="flex items-center gap-2 mb-1">
                                <div
                                    className={`w-2 h-2 rounded-full ${node.status === 'online'
                                            ? 'bg-green-500'
                                            : node.status === 'offline'
                                                ? 'bg-red-500'
                                                : 'bg-yellow-500'
                                        }`}
                                />
                                <span className="text-sm font-medium truncate">
                                    {node.operatorName || 'Unknown'}
                                </span>
                            </div>
                            <p className="text-xs font-mono text-muted-foreground">
                                {truncatePubkey(node.pubkey)}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Comparison Rows */}
                <div className="space-y-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b border-white/5">
                        Status & Health
                    </div>

                    <ComparisonRow
                        label="Status"
                        icon={<Server className="h-3 w-3" />}
                        nodes={selectedNodes}
                        getValue={(node) => (
                            <Badge
                                variant="outline"
                                className={`text-xs ${node.status === 'online'
                                        ? 'status-online'
                                        : node.status === 'offline'
                                            ? 'status-offline'
                                            : 'status-degraded'
                                    }`}
                            >
                                {node.status}
                            </Badge>
                        )}
                    />

                    <ComparisonRow
                        label="Health Score"
                        icon={<Activity className="h-3 w-3" />}
                        nodes={selectedNodes}
                        getValue={(node) =>
                            node.healthScore !== undefined ? `${node.healthScore}%` : 'N/A'
                        }
                        highlight="max"
                    />

                    <ComparisonRow
                        label="Version"
                        nodes={selectedNodes}
                        getValue={(node) => node.versionInfo?.version || 'N/A'}
                    />

                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 border-b border-white/5 mt-4">
                        Network & Location
                    </div>

                    <ComparisonRow
                        label="Region"
                        icon={<MapPin className="h-3 w-3" />}
                        nodes={selectedNodes}
                        getValue={(node) => node.network.region || 'Unknown'}
                    />

                    <ComparisonRow
                        label="Host"
                        nodes={selectedNodes}
                        getValue={(node) => node.network.host}
                    />

                    {selectedNodes.some((n) => n.stake) && (
                        <>
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 border-b border-white/5 mt-4">
                                Staking
                            </div>

                            <ComparisonRow
                                label="Staked"
                                icon={<Coins className="h-3 w-3" />}
                                nodes={selectedNodes}
                                getValue={(node) =>
                                    node.stake ? `${formatStake(node.stake.stakedAmount)} XAND` : 'N/A'
                                }
                                highlight="max"
                            />

                            <ComparisonRow
                                label="Commission"
                                nodes={selectedNodes}
                                getValue={(node) =>
                                    node.stake ? `${node.stake.commissionRate}%` : 'N/A'
                                }
                                highlight="min"
                            />
                        </>
                    )}

                    {selectedNodes.some((n) => n.storage) && (
                        <>
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 border-b border-white/5 mt-4">
                                Storage
                            </div>

                            <ComparisonRow
                                label="Capacity"
                                nodes={selectedNodes}
                                getValue={(node) =>
                                    node.storage ? formatBytes(node.storage.totalCapacityBytes) : 'N/A'
                                }
                                highlight="max"
                            />

                            <ComparisonRow
                                label="Usage"
                                nodes={selectedNodes}
                                getValue={(node) => {
                                    if (!node.storage) return 'N/A';
                                    const pct = (node.storage.usedBytes / node.storage.totalCapacityBytes) * 100;
                                    return `${pct.toFixed(1)}%`;
                                }}
                            />
                        </>
                    )}

                    {selectedNodes.some((n) => n.performance) && (
                        <>
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider py-2 border-b border-white/5 mt-4">
                                Performance
                            </div>

                            <ComparisonRow
                                label="Uptime (24h)"
                                nodes={selectedNodes}
                                getValue={(node) =>
                                    node.performance ? `${node.performance.uptime24h.toFixed(1)}%` : 'N/A'
                                }
                                highlight="max"
                            />

                            <ComparisonRow
                                label="Avg Latency"
                                nodes={selectedNodes}
                                getValue={(node) =>
                                    node.performance ? `${node.performance.avgLatencyMs}ms` : 'N/A'
                                }
                                highlight="min"
                            />
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/5">
                    <Button variant="ghost" onClick={handleClearAndClose}>
                        Clear All
                    </Button>
                    <Button onClick={handleClose}>
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
