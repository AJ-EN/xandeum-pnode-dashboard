/**
 * Represents the operational status of a pNode in the Xandeum network.
 */
export type PNodeStatus =
    | 'online'      // Node is actively participating in the network
    | 'offline'     // Node is not responding to gossip
    | 'degraded'    // Node is online but experiencing issues
    | 'syncing';    // Node is catching up with the network

/**
 * Network endpoint information for a pNode.
 */
export interface PNodeNetworkInfo {
    /** IP address or hostname of the pNode */
    host: string;

    /** Port used for gossip protocol communication */
    gossipPort: number;

    /** Port used for pRPC (pNode-specific RPC) interface */
    prpcPort: number;

    /** Geographic region or data center location (e.g., "us-east-1", "eu-west") */
    region?: string;

    /** Geographic coordinates for map visualization */
    geo?: {
        /** Latitude (-90 to 90) */
        lat: number;
        /** Longitude (-180 to 180) */
        lng: number;
    };
}

/**
 * Storage capacity and utilization metrics for a pNode.
 */
export interface PNodeStorageMetrics {
    /** Total storage capacity in bytes */
    totalCapacityBytes: number;

    /** Currently used storage in bytes */
    usedBytes: number;

    /** Number of data shards stored on this pNode */
    shardCount: number;

    /** Number of pods this pNode participates in */
    podCount: number;
}

/**
 * Staking and economic information for a pNode.
 */
export interface PNodeStakeInfo {
    /** Total XAND tokens staked/delegated to this pNode (in lamports) */
    stakedAmount: number;

    /** Operator's commission percentage on delegated stake (0-100) */
    commissionRate: number;

    /** Whether the pNode is eligible for delegation rewards */
    delegationEligible: boolean;
}

/**
 * Performance metrics useful for analytics and monitoring.
 */
export interface PNodePerformanceMetrics {
    /** Performance score (0-100) as used by Xandeum for reward calculation */
    performanceScore: number;

    /** Uptime percentage over the last 24 hours (0-100) */
    uptime24h: number;

    /** Average response latency in milliseconds */
    avgLatencyMs: number;

    /** Number of successful data retrievals */
    successfulRetrievals: number;

    /** Number of failed data retrievals */
    failedRetrievals: number;
}

/**
 * Version and software information for a pNode.
 */
export interface PNodeVersionInfo {
    /** Software version string (e.g., "0.8.0-reinheim") */
    version: string;

    /** Feature set identifier for protocol compatibility */
    featureSet?: number;

    /** Shred version for network compatibility */
    shredVersion?: number;
}

/**
 * Core pNode interface representing a Provider Node in the Xandeum network.
 * Designed for use in analytics dashboards, tables, and charts.
 */
export interface PNode {
    // ─────────────────────────────────────────────────────────────────────────────
    // Stable Identifiers
    // ─────────────────────────────────────────────────────────────────────────────

    /** Unique public key (base58-encoded) identifying this pNode on the network */
    pubkey: string;

    /** Human-readable operator name or alias (if registered) */
    operatorName?: string;

    /** Operator's wallet address for receiving rewards */
    operatorWallet?: string;

    // ─────────────────────────────────────────────────────────────────────────────
    // Status & Health
    // ─────────────────────────────────────────────────────────────────────────────

    /** Derived operational status based on gossip + health heuristics (online/offline/degraded/syncing) */
    status: PNodeStatus;

    /** Whether the pNode is currently active in gossip */
    isActive: boolean;

    /** Health check score (0-100), aggregated from various checks */
    healthScore?: number;

    // ─────────────────────────────────────────────────────────────────────────────
    // Network Information
    // ─────────────────────────────────────────────────────────────────────────────

    /** Network endpoint details */
    network: PNodeNetworkInfo;

    /** Software version information (may not be available from initial gossip) */
    versionInfo?: PNodeVersionInfo;

    // ─────────────────────────────────────────────────────────────────────────────
    // Storage & Capacity (derived from separate metrics fetch, not available in gossip)
    // ─────────────────────────────────────────────────────────────────────────────

    /** Storage capacity and utilization metrics (fetched separately from pRPC) */
    storage?: PNodeStorageMetrics;

    // ─────────────────────────────────────────────────────────────────────────────
    // Staking & Economics (derived from on-chain data, not available in gossip)
    // ─────────────────────────────────────────────────────────────────────────────

    /** Staking and delegation information (fetched separately from chain) */
    stake?: PNodeStakeInfo;

    /** Estimated monthly Storage Income (STOINC) in XAND tokens */
    estimatedMonthlyIncome?: number;

    // ─────────────────────────────────────────────────────────────────────────────
    // Performance Metrics (derived/aggregated, not available in gossip)
    // ─────────────────────────────────────────────────────────────────────────────

    /** Performance and reliability metrics (aggregated from analytics) */
    performance?: PNodePerformanceMetrics;

    // ─────────────────────────────────────────────────────────────────────────────
    // Timestamps
    // ─────────────────────────────────────────────────────────────────────────────

    /** First observed in gossip (derived, not authoritative - based on local observation) */
    firstSeenAt: number;

    /** Unix timestamp (ms) of the last gossip heartbeat received */
    lastSeenAt: number;

    /** Unix timestamp (ms) when this record was last updated */
    updatedAt: number;
}

/**
 * Summary statistics for a collection of pNodes.
 * Useful for dashboard overview widgets.
 */
export interface PNodeSummaryStats {
    /** Total number of pNodes in the network */
    totalNodes: number;

    /** Number of currently online pNodes */
    onlineNodes: number;

    /** Number of offline pNodes */
    offlineNodes: number;

    /** Number of degraded pNodes */
    degradedNodes: number;

    /** Total storage capacity across all pNodes (bytes) */
    totalStorageCapacity: number;

    /** Total storage used across all pNodes (bytes) */
    totalStorageUsed: number;

    /** Average performance score across all active pNodes */
    avgPerformanceScore: number;

    /** Total XAND staked across all pNodes */
    totalStaked: number;
}

/**
 * Filter options for querying pNodes.
 * Supports dashboard filtering and search functionality.
 */
export interface PNodeFilters {
    /** Filter by operational status */
    status?: PNodeStatus[];

    /** Filter by minimum performance score */
    minPerformanceScore?: number;

    /** Filter by geographic region */
    region?: string;

    /** Filter by minimum stake amount */
    minStake?: number;

    /** Search by pubkey or operator name */
    search?: string;

    /** Filter to show only active nodes */
    activeOnly?: boolean;
}

/**
 * Sort options for pNode listings.
 */
export type PNodeSortField =
    | 'pubkey'
    | 'status'
    | 'performanceScore'
    | 'stakedAmount'
    | 'storageUsed'
    | 'uptime24h'
    | 'lastSeenAt';

export interface PNodeSortOptions {
    field: PNodeSortField;
    direction: 'asc' | 'desc';
}
