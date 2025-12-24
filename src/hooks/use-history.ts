'use client';

import { useState, useRef, useCallback } from 'react';
import type { HistorySnapshot } from '@/types/pnode';

const HISTORY_STORAGE_KEY = 'xandeum-history';
const MAX_HISTORY_ENTRIES = 2880; // 24 hours at 30s intervals
const HISTORY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Load history from localStorage with error handling
 */
function loadHistory(): HistorySnapshot[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (!stored) return [];

        const history: HistorySnapshot[] = JSON.parse(stored);
        const now = Date.now();

        // Filter out entries older than 24 hours
        return history.filter((entry) => now - entry.timestamp < HISTORY_TTL_MS);
    } catch (error) {
        console.error('[useHistory] Failed to load history:', error);
        return [];
    }
}

/**
 * Save history to localStorage
 */
function saveHistory(history: HistorySnapshot[]): void {
    if (typeof window === 'undefined') return;

    try {
        // Limit to max entries
        const trimmed = history.slice(-MAX_HISTORY_ENTRIES);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
        console.error('[useHistory] Failed to save history:', error);
    }
}

interface UseHistoryResult {
    history: HistorySnapshot[];
    addSnapshot: (snapshot: Omit<HistorySnapshot, 'timestamp'>) => void;
    getRecentHistory: (count: number) => HistorySnapshot[];
    clearHistory: () => void;
}

/**
 * Hook for managing historical data snapshots in localStorage.
 * Persists data across page refreshes and accumulates over time.
 */
export function useHistory(): UseHistoryResult {
    const [history, setHistory] = useState<HistorySnapshot[]>(() => loadHistory());
    const lastUpdateRef = useRef<number>(0);

    const addSnapshot = useCallback((data: Omit<HistorySnapshot, 'timestamp'>) => {
        const now = Date.now();
        // Throttle to prevent too frequent updates
        if (now - lastUpdateRef.current < 5000) return;

        const snapshot: HistorySnapshot = {
            ...data,
            timestamp: now,
        };

        setHistory((prev) => {
            const next = [...prev, snapshot].slice(-MAX_HISTORY_ENTRIES);
            saveHistory(next);
            return next;
        });

        lastUpdateRef.current = now;
    }, []);

    const getRecentHistory = useCallback((count: number): HistorySnapshot[] => {
        return history.slice(-count);
    }, [history]);

    const clearHistory = useCallback(() => {
        setHistory([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(HISTORY_STORAGE_KEY);
        }
    }, []);

    return {
        history,
        addSnapshot,
        getRecentHistory,
        clearHistory,
    };
}

/**
 * Format history data for chart consumption.
 * Returns array with time labels and values.
 */
export function formatHistoryForChart(history: HistorySnapshot[], field: keyof Omit<HistorySnapshot, 'timestamp'>): {
    labels: string[];
    values: number[];
} {
    const labels = history.map((entry) => {
        const date = new Date(entry.timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const values = history.map((entry) => entry[field] as number);

    return { labels, values };
}
