'use client';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { PNode } from '@/types/pnode';
import {
    Copy,
    Check,
    Server,
    Network,
    HardDrive,
    Coins,
    Activity,
    Clock,
    MapPin,
    Code,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

interface NodeDetailSheetProps {
    node: PNode | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function CopyableField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
                <p className={`text-sm ${mono ? 'font-mono' : ''} truncate flex-1`}>{value}</p>
                <button
                    onClick={handleCopy}
                    className="p-1 rounded hover:bg-white/10 transition-colors shrink-0"
                    title="Copy"
                >
                    {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                </button>
            </div>
        </div>
    );
}

function InfoField({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) {
    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm">
                {value}
                {suffix && <span className="text-muted-foreground ml-1">{suffix}</span>}
            </p>
        </div>
    );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                    {icon}
                </div>
                <h3 className="text-sm font-medium">{title}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {children}
            </div>
        </div>
    );
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatXand(lamports: number): string {
    return (lamports / 1e9).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
}

function formatRelativeTime(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function NodeDetailSheet({ node, open, onOpenChange }: NodeDetailSheetProps) {
    const [showRawJson, setShowRawJson] = useState(false);

    if (!node) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-white/10">
                <SheetHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${node.status === 'online' ? 'bg-green-500' :
                            node.status === 'offline' ? 'bg-red-500' :
                                'bg-yellow-500'
                            }`} />
                        <SheetTitle className="text-xl">
                            {node.operatorName || 'Unknown Operator'}
                        </SheetTitle>
                    </div>
                    <SheetDescription className="font-mono text-xs">
                        {node.pubkey}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 mt-4">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={`capitalize ${node.status === 'online' ? 'status-online' :
                                node.status === 'offline' ? 'status-offline' :
                                    'status-degraded'
                                }`}
                        >
                            {node.status}
                        </Badge>
                        {node.healthScore !== undefined && (
                            <Badge variant="secondary">
                                Health: {node.healthScore}%
                            </Badge>
                        )}
                        {node.isActive && (
                            <Badge variant="outline" className="border-green-500/30 text-green-500">
                                Active
                            </Badge>
                        )}
                    </div>

                    <Separator className="bg-white/5" />

                    {/* Identity Section */}
                    <SectionCard title="Identity" icon={<Server className="h-3.5 w-3.5" />}>
                        <CopyableField label="Public Key" value={node.pubkey} mono />
                        <InfoField label="Operator" value={node.operatorName || 'Unknown'} />
                        {node.operatorWallet && (
                            <CopyableField label="Wallet" value={node.operatorWallet} mono />
                        )}
                    </SectionCard>

                    {/* Network Section */}
                    <SectionCard title="Network" icon={<Network className="h-3.5 w-3.5" />}>
                        <InfoField label="Host" value={node.network.host} />
                        <InfoField label="Gossip Port" value={node.network.gossipPort} />
                        <InfoField label="pRPC Port" value={node.network.prpcPort} />
                        <InfoField label="Region" value={node.network.region || 'Unknown'} />
                        {node.network.geo && (
                            <div className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {node.network.geo.lat.toFixed(4)}, {node.network.geo.lng.toFixed(4)}
                            </div>
                        )}
                    </SectionCard>

                    {/* Version Info */}
                    {node.versionInfo && (
                        <SectionCard title="Software" icon={<Code className="h-3.5 w-3.5" />}>
                            <InfoField label="Version" value={node.versionInfo.version} />
                            {node.versionInfo.featureSet && (
                                <InfoField label="Feature Set" value={node.versionInfo.featureSet} />
                            )}
                            {node.versionInfo.shredVersion && (
                                <InfoField label="Shred Version" value={node.versionInfo.shredVersion} />
                            )}
                        </SectionCard>
                    )}

                    {/* Storage Section */}
                    {node.storage && (
                        <SectionCard title="Storage" icon={<HardDrive className="h-3.5 w-3.5" />}>
                            <InfoField label="Capacity" value={formatBytes(node.storage.totalCapacityBytes)} />
                            <InfoField label="Used" value={formatBytes(node.storage.usedBytes)} />
                            <InfoField label="Shards" value={node.storage.shardCount.toLocaleString()} />
                            <InfoField label="Pods" value={node.storage.podCount} />
                            {/* Usage bar */}
                            <div className="col-span-2">
                                <p className="text-xs text-muted-foreground mb-1">Usage</p>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-500 to-teal-500"
                                        style={{
                                            width: `${(node.storage.usedBytes / node.storage.totalCapacityBytes) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </SectionCard>
                    )}

                    {/* Stake Section */}
                    {node.stake && (
                        <SectionCard title="Stake" icon={<Coins className="h-3.5 w-3.5" />}>
                            <InfoField label="Staked" value={formatXand(node.stake.stakedAmount)} suffix="XAND" />
                            <InfoField label="Commission" value={`${node.stake.commissionRate}%`} />
                            <InfoField
                                label="Delegation Eligible"
                                value={node.stake.delegationEligible ? 'Yes' : 'No'}
                            />
                            {node.estimatedMonthlyIncome !== undefined && (
                                <InfoField label="Est. Monthly Income" value={`~${node.estimatedMonthlyIncome}`} suffix="XAND" />
                            )}
                        </SectionCard>
                    )}

                    {/* Performance Section */}
                    {node.performance && (
                        <SectionCard title="Performance" icon={<Activity className="h-3.5 w-3.5" />}>
                            <InfoField label="Score" value={`${node.performance.performanceScore}%`} />
                            <InfoField label="Uptime (24h)" value={`${node.performance.uptime24h.toFixed(1)}%`} />
                            <InfoField label="Avg Latency" value={`${node.performance.avgLatencyMs}ms`} />
                            <InfoField label="Successful Retrievals" value={node.performance.successfulRetrievals.toLocaleString()} />
                            <InfoField label="Failed Retrievals" value={node.performance.failedRetrievals.toLocaleString()} />
                        </SectionCard>
                    )}

                    {/* Timestamps */}
                    <SectionCard title="Timestamps" icon={<Clock className="h-3.5 w-3.5" />}>
                        <InfoField label="First Seen" value={formatDate(node.firstSeenAt)} />
                        <InfoField label="Last Seen" value={formatRelativeTime(node.lastSeenAt)} />
                        <InfoField label="Last Updated" value={formatRelativeTime(node.updatedAt)} />
                    </SectionCard>

                    {/* Raw JSON */}
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden">
                        <button
                            onClick={() => setShowRawJson(!showRawJson)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Code className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Raw JSON</span>
                            </div>
                            {showRawJson ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                        </button>
                        {showRawJson && (
                            <pre className="p-4 pt-0 text-xs font-mono text-muted-foreground overflow-x-auto max-h-64 overflow-y-auto">
                                {JSON.stringify(node, null, 2)}
                            </pre>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
