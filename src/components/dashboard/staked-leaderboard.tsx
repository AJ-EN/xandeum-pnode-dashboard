'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award, TrendingUp, Percent } from 'lucide-react';
import type { PNode } from '@/types/pnode';

interface StakedLeaderboardProps {
    nodes: PNode[];
    isLoading: boolean;
    onNodeSelect?: (node: PNode) => void;
}

function formatStake(lamports: number): string {
    const sol = lamports / 1e9;
    if (sol >= 1e6) return `${(sol / 1e6).toFixed(2)}M`;
    if (sol >= 1e3) return `${(sol / 1e3).toFixed(1)}K`;
    return sol.toFixed(0);
}

function truncatePubkey(pubkey: string): string {
    return `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`;
}

function getRankIcon(rank: number) {
    switch (rank) {
        case 1:
            return <Trophy className="h-4 w-4 text-yellow-400" />;
        case 2:
            return <Medal className="h-4 w-4 text-gray-400" />;
        case 3:
            return <Award className="h-4 w-4 text-amber-600" />;
        default:
            return <span className="text-xs font-medium text-muted-foreground w-4 text-center">{rank}</span>;
    }
}

function getRankBg(rank: number): string {
    switch (rank) {
        case 1:
            return 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50';
        case 2:
            return 'bg-gray-500/10 border-gray-500/30 hover:border-gray-500/50';
        case 3:
            return 'bg-amber-600/10 border-amber-600/30 hover:border-amber-600/50';
        default:
            return 'bg-white/5 border-white/10 hover:border-white/20';
    }
}

export function StakedLeaderboard({ nodes, isLoading, onNodeSelect }: StakedLeaderboardProps) {
    const { topStaked, totalStake } = useMemo(() => {
        const withStake = nodes.filter((n) => n.stake && n.stake.stakedAmount > 0);
        const sorted = [...withStake].sort((a, b) =>
            (b.stake?.stakedAmount ?? 0) - (a.stake?.stakedAmount ?? 0)
        );
        const total = withStake.reduce((sum, n) => sum + (n.stake?.stakedAmount ?? 0), 0);
        return {
            topStaked: sorted.slice(0, 10),
            totalStake: total,
        };
    }, [nodes]);

    return (
        <Card className="glass-card animate-fade-in-up animate-delay-5 h-[320px] flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-400" />
                        <CardTitle className="text-base font-medium">Top Staked Nodes</CardTitle>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>{formatStake(totalStake)} XAND</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden pt-0">
                {isLoading ? (
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-10 bg-white/10 rounded animate-pulse" />
                        ))}
                    </div>
                ) : topStaked.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-sm text-muted-foreground text-center">
                            No staking data available
                        </p>
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                        {topStaked.map((node, index) => {
                            const rank = index + 1;
                            const stake = node.stake?.stakedAmount ?? 0;
                            const sharePercent = totalStake > 0 ? (stake / totalStake) * 100 : 0;

                            return (
                                <button
                                    key={node.pubkey}
                                    onClick={() => onNodeSelect?.(node)}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-all ${getRankBg(rank)} cursor-pointer`}
                                >
                                    <div className="flex items-center justify-center w-6">
                                        {getRankIcon(rank)}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-medium truncate">
                                            {node.operatorName || truncatePubkey(node.pubkey)}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-mono">
                                            {truncatePubkey(node.pubkey)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-primary">
                                            {formatStake(stake)}
                                        </p>
                                        <div className="flex items-center gap-1 justify-end">
                                            <Percent className="h-2.5 w-2.5 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground">
                                                {sharePercent.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
