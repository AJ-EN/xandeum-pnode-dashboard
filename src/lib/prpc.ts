import type { PNode, PNodeStatus } from '@/types/pnode';

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const PRPC_URL = process.env.XANDEUM_PRPC_URL;
const FETCH_TIMEOUT_MS = 10000; // 10 second timeout

// ─────────────────────────────────────────────────────────────────────────────
// Geographic Data for Mock Nodes
// ─────────────────────────────────────────────────────────────────────────────

interface GeoLocation {
    region: string;
    lat: number;
    lng: number;
    variance: number; // How much to randomize around this point
}

/** Realistic data center locations across US, EU, and Asia */
const GEO_LOCATIONS: GeoLocation[] = [
    // United States
    { region: 'us-east-1', lat: 39.0438, lng: -77.4874, variance: 2 },      // Virginia
    { region: 'us-east-2', lat: 40.4173, lng: -82.9071, variance: 1.5 },    // Ohio
    { region: 'us-west-1', lat: 37.3382, lng: -121.8863, variance: 1.5 },   // N. California
    { region: 'us-west-2', lat: 45.5234, lng: -122.6762, variance: 2 },     // Oregon
    { region: 'us-central-1', lat: 41.8781, lng: -87.6298, variance: 1.5 }, // Chicago
    // Europe
    { region: 'eu-west-1', lat: 53.3498, lng: -6.2603, variance: 1 },       // Ireland
    { region: 'eu-west-2', lat: 51.5074, lng: -0.1278, variance: 0.5 },     // London
    { region: 'eu-central-1', lat: 50.1109, lng: 8.6821, variance: 1 },     // Frankfurt
    { region: 'eu-north-1', lat: 59.3293, lng: 18.0686, variance: 0.5 },    // Stockholm
    // Asia Pacific
    { region: 'ap-southeast-1', lat: 1.3521, lng: 103.8198, variance: 0.5 }, // Singapore
    { region: 'ap-northeast-1', lat: 35.6762, lng: 139.6503, variance: 1 },  // Tokyo
    { region: 'ap-northeast-2', lat: 37.5665, lng: 126.978, variance: 0.5 }, // Seoul
    { region: 'ap-south-1', lat: 19.076, lng: 72.8777, variance: 1 },        // Mumbai
    { region: 'ap-southeast-2', lat: -33.8688, lng: 151.2093, variance: 1 }, // Sydney
];

/** Operator name prefixes for realistic mock data */
const OPERATOR_PREFIXES = [
    'Xandeum', 'Solana', 'Crypto', 'Node', 'Stake', 'Web3', 'Chain',
    'Block', 'Ledger', 'Validator', 'Storage', 'Data', 'Cloud', 'Decen',
];

const OPERATOR_SUFFIXES = [
    'Labs', 'Network', 'Capital', 'DAO', 'Infra', 'Systems', 'Tech',
    'Solutions', 'Services', 'Hub', 'Pool', 'Ops', 'Collective',
];

const SOFTWARE_VERSIONS = [
    '0.8.0-reinheim',
    '0.8.1-reinheim',
    '0.7.5-munich',
    '0.8.0-beta',
    '0.7.4-munich',
];

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

/** Generate a random base58-like pubkey string */
function generatePubkey(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 44; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/** Generate a random IP address */
function generateIP(): string {
    // Avoid reserved ranges, use realistic public IPs
    const ranges = [
        () => `${34 + Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
        () => `${100 + Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
        () => `${150 + Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
    ];
    return ranges[Math.floor(Math.random() * ranges.length)]();
}

/** Generate a random operator name */
function generateOperatorName(): string {
    const prefix = OPERATOR_PREFIXES[Math.floor(Math.random() * OPERATOR_PREFIXES.length)];
    const suffix = OPERATOR_SUFFIXES[Math.floor(Math.random() * OPERATOR_SUFFIXES.length)];
    return `${prefix} ${suffix}`;
}

/** Get a random geo location with some variance */
function getRandomGeoLocation(): GeoLocation & { actualLat: number; actualLng: number } {
    const loc = GEO_LOCATIONS[Math.floor(Math.random() * GEO_LOCATIONS.length)];
    return {
        ...loc,
        actualLat: loc.lat + (Math.random() - 0.5) * loc.variance * 2,
        actualLng: loc.lng + (Math.random() - 0.5) * loc.variance * 2,
    };
}

/** Derive status based on timestamps and health metrics */
function deriveStatus(lastSeenAt: number, healthScore?: number): { status: PNodeStatus; isActive: boolean } {
    const now = Date.now();
    const timeSinceLastSeen = now - lastSeenAt;

    // Offline: not seen in last 5 minutes
    if (timeSinceLastSeen > 5 * 60 * 1000) {
        return { status: 'offline', isActive: false };
    }

    // Syncing: seen recently but low health score
    if (healthScore !== undefined && healthScore < 50) {
        return { status: 'syncing', isActive: true };
    }

    // Degraded: seen but health is concerning
    if (healthScore !== undefined && healthScore < 80) {
        return { status: 'degraded', isActive: true };
    }

    // Online: healthy and recently seen
    return { status: 'online', isActive: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data Generator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate realistic mock pNode data for development and fallback scenarios.
 * @param count Number of mock nodes to generate (default: 20-50 random)
 */
export function generateMockNodes(count?: number): PNode[] {
    const nodeCount = count ?? Math.floor(Math.random() * 31) + 20; // 20-50 nodes
    const nodes: PNode[] = [];
    const now = Date.now();

    for (let i = 0; i < nodeCount; i++) {
        const geoLoc = getRandomGeoLocation();
        const pubkey = generatePubkey();

        // Randomize timing - most nodes online, some offline
        const isRecentlyActive = Math.random() > 0.15; // 85% chance of being active
        const lastSeenOffset = isRecentlyActive
            ? Math.floor(Math.random() * 2 * 60 * 1000) // Last 2 minutes
            : Math.floor(Math.random() * 30 * 60 * 1000) + 5 * 60 * 1000; // 5-35 min ago

        const lastSeenAt = now - lastSeenOffset;
        const firstSeenAt = now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000); // Up to 30 days ago

        // Health score - most are healthy
        const healthScore = isRecentlyActive
            ? Math.floor(Math.random() * 30) + 70 // 70-100 for active
            : Math.floor(Math.random() * 60); // 0-60 for inactive

        const { status, isActive } = deriveStatus(lastSeenAt, healthScore);

        // Storage metrics (optional, simulate having data for ~70% of nodes)
        const hasStorageMetrics = Math.random() > 0.3;
        const totalCapacityBytes = (Math.floor(Math.random() * 10) + 1) * 1024 * 1024 * 1024 * 1024; // 1-10 TB

        // Stake info (optional, simulate having data for ~60% of nodes)
        const hasStakeInfo = Math.random() > 0.4;

        // Performance metrics (optional, simulate having data for ~50% of nodes)
        const hasPerformanceMetrics = Math.random() > 0.5;

        const node: PNode = {
            // Identifiers
            pubkey,
            operatorName: Math.random() > 0.2 ? generateOperatorName() : undefined,
            operatorWallet: Math.random() > 0.3 ? generatePubkey() : undefined,

            // Status & Health
            status,
            isActive,
            healthScore,

            // Network
            network: {
                host: generateIP(),
                gossipPort: 8001 + Math.floor(Math.random() * 100),
                prpcPort: 8899 + Math.floor(Math.random() * 100),
                region: geoLoc.region,
                geo: {
                    lat: geoLoc.actualLat,
                    lng: geoLoc.actualLng,
                },
            },

            // Version info (optional)
            versionInfo: Math.random() > 0.2
                ? {
                    version: SOFTWARE_VERSIONS[Math.floor(Math.random() * SOFTWARE_VERSIONS.length)],
                    featureSet: Math.floor(Math.random() * 1000000) + 3000000,
                    shredVersion: Math.floor(Math.random() * 100) + 50000,
                }
                : undefined,

            // Storage (optional)
            storage: hasStorageMetrics
                ? {
                    totalCapacityBytes,
                    usedBytes: Math.floor(totalCapacityBytes * (Math.random() * 0.8 + 0.1)), // 10-90% used
                    shardCount: Math.floor(Math.random() * 10000) + 100,
                    podCount: Math.floor(Math.random() * 20) + 1,
                }
                : undefined,

            // Stake (optional)
            stake: hasStakeInfo
                ? {
                    stakedAmount: Math.floor(Math.random() * 1000000 * 1e9), // Up to 1M XAND in lamports
                    commissionRate: Math.floor(Math.random() * 10) + 1, // 1-10%
                    delegationEligible: Math.random() > 0.2,
                }
                : undefined,

            estimatedMonthlyIncome: hasStakeInfo
                ? Math.floor(Math.random() * 10000) + 100
                : undefined,

            // Performance (optional)
            performance: hasPerformanceMetrics
                ? {
                    performanceScore: Math.floor(Math.random() * 30) + 70,
                    uptime24h: Math.random() * 10 + 90, // 90-100%
                    avgLatencyMs: Math.floor(Math.random() * 100) + 10,
                    successfulRetrievals: Math.floor(Math.random() * 100000),
                    failedRetrievals: Math.floor(Math.random() * 100),
                }
                : undefined,

            // Timestamps
            firstSeenAt,
            lastSeenAt,
            updatedAt: now,
        };

        nodes.push(node);
    }

    // Sort by status (online first) then by health score
    return nodes.sort((a, b) => {
        const statusOrder = { online: 0, degraded: 1, syncing: 2, offline: 3 };
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        return (b.healthScore ?? 0) - (a.healthScore ?? 0);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// RPC Response Types - Based on actual Xandeum getClusterNodes response
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Response from the Xandeum/Solana getClusterNodes RPC method.
 * This is the actual schema returned by the Xandeum devnet.
 */
interface RpcClusterNode {
    /** Base58-encoded public key of the node */
    pubkey: string;
    /** Gossip network address (IP:port) */
    gossip?: string;
    /** RPC endpoint address (IP:port) */
    rpc?: string;
    /** TPU (Transaction Processing Unit) address */
    tpu?: string;
    /** TVU (Transaction Validation Unit) address */
    tvu?: string;
    /** PubSub websocket address */
    pubsub?: string;
    /** Serve repair address */
    serveRepair?: string;
    /** TPU forwards address */
    tpuForwards?: string;
    /** TPU forwards QUIC address */
    tpuForwardsQuic?: string;
    /** TPU QUIC address */
    tpuQuic?: string;
    /** TPU vote address */
    tpuVote?: string;
    /** Software version string */
    version?: string;
    /** Feature set identifier */
    featureSet?: number;
    /** Shred version for network compatibility */
    shredVersion?: number;
}

interface RpcResponse<T> {
    jsonrpc: '2.0';
    id: number;
    result?: T;
    error?: {
        code: number;
        message: string;
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// RPC Data Mapping
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map raw RPC cluster node data to our PNode interface.
 * Nodes returned from getClusterNodes are assumed to be online (in gossip).
 */
function mapRpcNodeToPNode(rpcNode: RpcClusterNode, geoData?: GeoIpResult): PNode {
    const now = Date.now();

    // Parse host:port from gossip/rpc fields
    const gossipParts = rpcNode.gossip?.split(':') ?? [];
    const rpcParts = rpcNode.rpc?.split(':') ?? [];

    const host = gossipParts[0] || rpcParts[0] || 'unknown';
    const gossipPort = parseInt(gossipParts[1]) || 8000;
    const prpcPort = parseInt(rpcParts[1]) || 8899;

    // All nodes from getClusterNodes are in gossip, so they're online
    const status: PNodeStatus = 'online';
    const isActive = true;

    return {
        pubkey: rpcNode.pubkey,
        status,
        isActive,
        healthScore: 100, // Assume healthy since they're in gossip
        network: {
            host,
            gossipPort,
            prpcPort,
            region: geoData?.regionName,
            geo: geoData?.lat && geoData?.lon
                ? { lat: geoData.lat, lng: geoData.lon }
                : undefined,
        },
        versionInfo: rpcNode.version
            ? {
                version: rpcNode.version,
                featureSet: rpcNode.featureSet,
                shredVersion: rpcNode.shredVersion,
            }
            : undefined,
        firstSeenAt: now,
        lastSeenAt: now,
        updatedAt: now,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// GeoIP Lookup (using free ip-api.com batch endpoint)
// ─────────────────────────────────────────────────────────────────────────────

interface GeoIpResult {
    query: string; // The IP address
    status: 'success' | 'fail';
    country?: string;
    countryCode?: string;
    region?: string;
    regionName?: string;
    city?: string;
    lat?: number;
    lon?: number;
    isp?: string;
}

// In-memory cache for GeoIP results to reduce API calls
// This prevents hitting ip-api.com's rate limit (45 req/min)
const geoIpCache = new Map<string, { result: GeoIpResult; timestamp: number }>();
const GEO_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Batch lookup geographic coordinates for a list of IP addresses.
 * Uses the free ip-api.com batch endpoint (max 100 IPs per request).
 * Results are cached for 5 minutes to reduce API calls.
 * 
 * Note: ip-api.com has rate limits (45 requests/minute for free tier).
 */
async function batchGeoIpLookup(ips: string[]): Promise<Map<string, GeoIpResult>> {
    const geoMap = new Map<string, GeoIpResult>();
    const now = Date.now();

    if (ips.length === 0) return geoMap;

    // Check cache first, collect IPs that need fetching
    const ipsToFetch: string[] = [];
    for (const ip of ips) {
        const cached = geoIpCache.get(ip);
        if (cached && (now - cached.timestamp) < GEO_CACHE_TTL_MS) {
            geoMap.set(ip, cached.result);
        } else {
            ipsToFetch.push(ip);
        }
    }

    // If all IPs were cached, return early
    if (ipsToFetch.length === 0) {
        console.log(`[prpc] GeoIP lookup: ${geoMap.size}/${ips.length} IPs resolved (all cached)`);
        return geoMap;
    }

    // ip-api.com batch endpoint supports up to 100 IPs
    const batchSize = 100;
    const batches: string[][] = [];

    for (let i = 0; i < ipsToFetch.length; i += batchSize) {
        batches.push(ipsToFetch.slice(i, i + batchSize));
    }

    for (const batch of batches) {
        try {
            // The batch endpoint takes a POST with JSON array of IPs
            const response = await fetch('http://ip-api.com/batch?fields=status,query,country,countryCode,regionName,city,lat,lon,isp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(batch),
            });

            if (response.ok) {
                const results: GeoIpResult[] = await response.json();
                for (const result of results) {
                    if (result.status === 'success' && result.query) {
                        geoMap.set(result.query, result);
                        // Cache the successful result
                        geoIpCache.set(result.query, { result, timestamp: now });
                    }
                }
            } else if (response.status === 429) {
                // Rate limited - use cached data or skip
                console.warn('[prpc] GeoIP rate limited, using cached data where available');
            }
        } catch (error) {
            console.warn('[prpc] GeoIP batch lookup failed:', error);
            // Continue without geo data - the map will just render without coordinates
        }
    }

    console.log(`[prpc] GeoIP lookup: ${geoMap.size}/${ips.length} IPs resolved (${ips.length - ipsToFetch.length} cached)`);
    return geoMap;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Fetch Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch pNode data using a hybrid strategy:
 * 1. If XANDEUM_PRPC_URL is set, attempt real RPC fetch
 * 2. On failure, timeout, or missing env var, fall back to mock data
 * 3. Optionally resolve IP addresses to geographic coordinates
 *
 * @returns Array of PNode objects
 */
export async function fetchPNodes(): Promise<PNode[]> {
    // If no RPC URL configured, use mock data immediately
    if (!PRPC_URL) {
        console.log('[prpc] No XANDEUM_PRPC_URL configured, using mock data');
        return generateMockNodes();
    }

    try {
        console.log(`[prpc] Fetching from ${PRPC_URL}`);

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        const response = await fetch(PRPC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getClusterNodes', // Standard Solana-compatible RPC method
                params: [],
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: RpcResponse<RpcClusterNode[]> = await response.json();

        if (data.error) {
            throw new Error(`RPC Error ${data.error.code}: ${data.error.message}`);
        }

        if (!data.result || !Array.isArray(data.result)) {
            throw new Error('Invalid RPC response: missing result array');
        }

        console.log(`[prpc] Fetched ${data.result.length} nodes from Xandeum RPC`);

        // Extract IPs for GeoIP lookup
        const ips = data.result
            .map((node) => {
                const gossipParts = node.gossip?.split(':') ?? [];
                const rpcParts = node.rpc?.split(':') ?? [];
                return gossipParts[0] || rpcParts[0];
            })
            .filter((ip): ip is string => !!ip && ip !== 'unknown');

        // Batch GeoIP lookup
        const geoMap = await batchGeoIpLookup(ips);

        // Map RPC data to PNode interface with geo data
        return data.result.map((rpcNode) => {
            const gossipParts = rpcNode.gossip?.split(':') ?? [];
            const rpcParts = rpcNode.rpc?.split(':') ?? [];
            const ip = gossipParts[0] || rpcParts[0];
            const geoData = ip ? geoMap.get(ip) : undefined;
            return mapRpcNodeToPNode(rpcNode, geoData);
        });
    } catch (error) {
        // Log the error and fall back to mock data
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                console.warn(`[prpc] Fetch timeout after ${FETCH_TIMEOUT_MS}ms, using mock data`);
            } else {
                console.warn(`[prpc] Fetch failed: ${error.message}, using mock data`);
            }
        } else {
            console.warn('[prpc] Unknown fetch error, using mock data');
        }

        return generateMockNodes();
    }
}

/**
 * Get a single pNode by its pubkey.
 * Falls back to mock data if not found or fetch fails.
 */
export async function fetchPNodeByPubkey(pubkey: string): Promise<PNode | null> {
    const nodes = await fetchPNodes();
    return nodes.find((node) => node.pubkey === pubkey) ?? null;
}
