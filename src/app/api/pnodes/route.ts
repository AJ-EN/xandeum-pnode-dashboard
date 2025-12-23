import { NextResponse } from 'next/server';
import { fetchPNodes } from '@/lib/prpc';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/pnodes
 * Fetch all pNodes from Xandeum pRPC (or mock data as fallback)
 */
export async function GET() {
    try {
        const { nodes, source } = await fetchPNodes();

        return NextResponse.json({
            success: true,
            data: nodes,
            count: nodes.length,
            source, // 'live' or 'mock'
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
