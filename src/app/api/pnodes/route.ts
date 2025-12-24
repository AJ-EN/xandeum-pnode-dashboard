import { NextResponse } from 'next/server';
import { fetchPNodes, fetchNetworkStatus, fetchVoteAccounts, enrichNodesWithVoteAccounts } from '@/lib/prpc';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/pnodes
 * Fetch all pNodes from Xandeum pRPC (or mock data as fallback)
 * Also fetches network status and enriches nodes with vote account data
 */
export async function GET() {
    try {
        // Fetch all data in parallel
        const [pnodesResult, networkResult, voteResult] = await Promise.all([
            fetchPNodes(),
            fetchNetworkStatus(),
            fetchVoteAccounts(),
        ]);

        // Enrich nodes with vote account stake data
        const enrichedNodes = enrichNodesWithVoteAccounts(pnodesResult.nodes, voteResult.accounts);

        return NextResponse.json({
            success: true,
            data: enrichedNodes,
            count: enrichedNodes.length,
            source: pnodesResult.source,
            networkStatus: networkResult.status,
            voteAccountCount: voteResult.accounts.length,
            timestamp: Date.now(),
        });
    } catch (error) {
        console.error('[API] Failed to fetch pNodes:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch pNode data',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

