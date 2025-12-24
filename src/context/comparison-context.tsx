'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { PNode } from '@/types/pnode';

const MAX_COMPARISON_NODES = 4;

interface ComparisonContextValue {
    selectedPubkeys: Set<string>;
    selectedNodes: PNode[];
    isSelected: (pubkey: string) => boolean;
    toggleNode: (pubkey: string, node: PNode) => void;
    clearAll: () => void;
    canAddMore: boolean;
    count: number;
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

export function useComparison() {
    const context = useContext(ComparisonContext);
    if (!context) {
        throw new Error('useComparison must be used within a ComparisonProvider');
    }
    return context;
}

interface ComparisonProviderProps {
    children: ReactNode;
}

export function ComparisonProvider({ children }: ComparisonProviderProps) {
    const [selectedPubkeys, setSelectedPubkeys] = useState<Set<string>>(new Set());
    const [selectedNodes, setSelectedNodes] = useState<PNode[]>([]);

    const isSelected = useCallback((pubkey: string) => {
        return selectedPubkeys.has(pubkey);
    }, [selectedPubkeys]);

    const toggleNode = useCallback((pubkey: string, node: PNode) => {
        setSelectedPubkeys((prev) => {
            const next = new Set(prev);
            if (next.has(pubkey)) {
                next.delete(pubkey);
                setSelectedNodes((nodes) => nodes.filter((n) => n.pubkey !== pubkey));
            } else if (next.size < MAX_COMPARISON_NODES) {
                next.add(pubkey);
                setSelectedNodes((nodes) => [...nodes, node]);
            }
            return next;
        });
    }, []);

    const clearAll = useCallback(() => {
        setSelectedPubkeys(new Set());
        setSelectedNodes([]);
    }, []);

    const value: ComparisonContextValue = {
        selectedPubkeys,
        selectedNodes,
        isSelected,
        toggleNode,
        clearAll,
        canAddMore: selectedPubkeys.size < MAX_COMPARISON_NODES,
        count: selectedPubkeys.size,
    };

    return (
        <ComparisonContext.Provider value={value}>
            {children}
        </ComparisonContext.Provider>
    );
}
