'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { PNode, PNodeStatus } from '@/types/pnode';
import {
    Search,
    ChevronUp,
    ChevronDown,
    Copy,
    Check,
    ExternalLink,
} from 'lucide-react';

interface NodeTableProps {
    nodes: PNode[];
    isLoading: boolean;
    onNodeSelect: (node: PNode) => void;
}

type SortField = 'status' | 'pubkey' | 'region' | 'version' | 'healthScore';
type SortDirection = 'asc' | 'desc';

function truncatePubkey(pubkey: string, chars: number = 8): string {
    if (pubkey.length <= chars * 2) return pubkey;
    return `${pubkey.slice(0, chars)}...${pubkey.slice(-chars)}`;
}

function StatusBadge({ status }: { status: PNodeStatus }) {
    return (
        <Badge
            variant="outline"
            className={`capitalize font-medium ${status === 'online' ? 'status-online' :
                status === 'offline' ? 'status-offline' :
                    'status-degraded'
                }`}
        >
            <span className={`w-2 h-2 rounded-full mr-1.5 ${status === 'online' ? 'bg-green-500' :
                status === 'offline' ? 'bg-red-500' :
                    'bg-yellow-500'
                }`} />
            {status}
        </Badge>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title="Copy pubkey"
        >
            {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            )}
        </button>
    );
}

function HealthBar({ score }: { score: number }) {
    const color = score >= 90 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-500`}
                    style={{ width: `${score}%` }}
                />
            </div>
            <span className="text-xs text-muted-foreground w-8">{score}%</span>
        </div>
    );
}

export function NodeTable({ nodes, isLoading, onNodeSelect }: NodeTableProps) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [versionFilter, setVersionFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('status');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcut: Press '/' to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only trigger if not already in an input/textarea
            if (
                e.key === '/' &&
                !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)
            ) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Get unique versions for filter dropdown
    const versions = useMemo(() => {
        const v = new Set<string>();
        nodes.forEach(n => {
            if (n.versionInfo?.version) v.add(n.versionInfo.version);
        });
        return Array.from(v).sort();
    }, [nodes]);

    // Filter and sort nodes
    const filteredNodes = useMemo(() => {
        let result = [...nodes];

        // Search filter
        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(n =>
                n.pubkey.toLowerCase().includes(lower) ||
                n.operatorName?.toLowerCase().includes(lower) ||
                n.network.region?.toLowerCase().includes(lower)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(n => n.status === statusFilter);
        }

        // Version filter
        if (versionFilter !== 'all') {
            result = result.filter(n => n.versionInfo?.version === versionFilter);
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'status':
                    const order = { online: 0, degraded: 1, syncing: 2, offline: 3 };
                    comparison = order[a.status] - order[b.status];
                    break;
                case 'pubkey':
                    comparison = a.pubkey.localeCompare(b.pubkey);
                    break;
                case 'region':
                    comparison = (a.network.region || 'zzz').localeCompare(b.network.region || 'zzz');
                    break;
                case 'version':
                    comparison = (a.versionInfo?.version || '').localeCompare(b.versionInfo?.version || '');
                    break;
                case 'healthScore':
                    comparison = (b.healthScore || 0) - (a.healthScore || 0);
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [nodes, search, statusFilter, versionFilter, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Helper function to render sort icon - NOT a component to avoid "created during render" error
    const renderSortIcon = (field: SortField) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ?
            <ChevronUp className="h-4 w-4" /> :
            <ChevronDown className="h-4 w-4" />;
    };

    return (
        <div className="space-y-4 animate-fade-in-up animate-delay-5">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search by pubkey, operator, or region..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-12 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    {/* Keyboard shortcut hint */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center">
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/5 border border-white/10 rounded text-muted-foreground">
                            /
                        </kbd>
                    </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="degraded">Degraded</SelectItem>
                        <SelectItem value="syncing">Syncing</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={versionFilter} onValueChange={setVersionFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Version" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Versions</SelectItem>
                        {versions.map(v => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="glass-card rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-white/5">
                            <TableHead
                                className="cursor-pointer select-none hover:text-foreground transition-colors"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center gap-1">
                                    Status {renderSortIcon('status')}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none hover:text-foreground transition-colors"
                                onClick={() => handleSort('pubkey')}
                            >
                                <div className="flex items-center gap-1">
                                    Pubkey {renderSortIcon('pubkey')}
                                </div>
                            </TableHead>
                            <TableHead>Operator</TableHead>
                            <TableHead
                                className="cursor-pointer select-none hover:text-foreground transition-colors hidden md:table-cell"
                                onClick={() => handleSort('region')}
                            >
                                <div className="flex items-center gap-1">
                                    Region {renderSortIcon('region')}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none hover:text-foreground transition-colors hidden lg:table-cell"
                                onClick={() => handleSort('version')}
                            >
                                <div className="flex items-center gap-1">
                                    Version {renderSortIcon('version')}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none hover:text-foreground transition-colors"
                                onClick={() => handleSort('healthScore')}
                            >
                                <div className="flex items-center gap-1">
                                    Health {renderSortIcon('healthScore')}
                                </div>
                            </TableHead>
                            <TableHead className="w-10"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-6 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredNodes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No nodes found matching your filters
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredNodes.map((node) => (
                                <TableRow
                                    key={node.pubkey}
                                    onClick={() => onNodeSelect(node)}
                                    className="cursor-pointer hover:bg-white/5 transition-colors"
                                >
                                    <TableCell>
                                        <StatusBadge status={node.status} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 font-mono text-sm">
                                            {truncatePubkey(node.pubkey)}
                                            <CopyButton text={node.pubkey} />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">
                                            {node.operatorName || <span className="text-muted-foreground">Unknown</span>}
                                        </span>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <span className="text-sm text-muted-foreground">
                                            {node.network.region || '—'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        <code className="text-xs bg-secondary/50 px-1.5 py-0.5 rounded">
                                            {node.versionInfo?.version || '—'}
                                        </code>
                                    </TableCell>
                                    <TableCell>
                                        <HealthBar score={node.healthScore || 0} />
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Results count */}
            {!isLoading && (
                <p className="text-sm text-muted-foreground">
                    Showing {filteredNodes.length} of {nodes.length} nodes
                </p>
            )}
        </div>
    );
}
