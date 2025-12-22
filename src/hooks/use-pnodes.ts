'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PNode, PNodeSummaryStats } from '@/types/pnode';

interface UsePNodesResult {
    nodes: PNode[];
    stats: PNodeSummaryStats;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    lastUpdated: number | null;
}

const EMPTY_STATS: PNodeSummaryStats = {
    totalNodes: 0,
    onlineNodes: 0,
    offlineNodes: 0,
    degradedNodes: 0,
    totalStorageCapacity: 0,
    totalStorageUsed: 0,
    avgPerformanceScore: 0,
    totalStaked: 0,
};

/**
 * Calculate summary statistics from an array of pNodes
 */
function calculateStats(nodes: PNode[]): PNodeSummaryStats {
    if (nodes.length === 0) return EMPTY_STATS;

    let onlineNodes = 0;
    let offlineNodes = 0;
    let degradedNodes = 0;
    let totalStorageCapacity = 0;
    let totalStorageUsed = 0;
    let totalPerformanceScore = 0;
    let performanceNodeCount = 0;
    let totalStaked = 0;

    for (const node of nodes) {
        switch (node.status) {
            case 'online':
                onlineNodes++;
                break;
            case 'offline':
                offlineNodes++;
                break;
            case 'degraded':
            case 'syncing':
                degradedNodes++;
                break;
        }

        if (node.storage) {
            totalStorageCapacity += node.storage.totalCapacityBytes;
            totalStorageUsed += node.storage.usedBytes;
        }

        if (node.performance) {
            totalPerformanceScore += node.performance.performanceScore;
            performanceNodeCount++;
        }

        if (node.stake) {
            totalStaked += node.stake.stakedAmount;
        }
    }

    return {
        totalNodes: nodes.length,
        onlineNodes,
        offlineNodes,
        degradedNodes,
        totalStorageCapacity,
        totalStorageUsed,
        avgPerformanceScore: performanceNodeCount > 0
            ? Math.round(totalPerformanceScore / performanceNodeCount)
            : 0,
        totalStaked,
    };
}

/**
 * Hook to fetch and manage pNode data
 */
export function usePNodes(): UsePNodesResult {
    const [nodes, setNodes] = useState<PNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);

    const fetchNodes = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/pnodes');
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || data.message || 'Failed to fetch nodes');
            }

            setNodes(data.data);
            setLastUpdated(Date.now());
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            console.error('[usePNodes] Fetch error:', message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch on mount
    useEffect(() => {
        fetchNodes();
    }, [fetchNodes]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(fetchNodes, 30000);
        return () => clearInterval(interval);
    }, [fetchNodes]);

    const stats = calculateStats(nodes);

    return {
        nodes,
        stats,
        isLoading,
        error,
        refetch: fetchNodes,
        lastUpdated,
    };
}
