import type { PNode } from '@/types/pnode';

/**
 * Export pNode data to CSV format and trigger download.
 */
export function exportToCSV(nodes: PNode[], filename: string = 'xandeum-nodes.csv'): void {
    // Define columns to export
    const headers = [
        'Pubkey',
        'Status',
        'Health Score',
        'Operator Name',
        'Host',
        'Region',
        'Latitude',
        'Longitude',
        'Version',
        'Staked Amount (XAND)',
        'Commission Rate (%)',
        'Storage Capacity (GB)',
        'Storage Used (GB)',
        'Performance Score',
        'Uptime 24h (%)',
        'Last Seen',
    ];

    // Helper to escape CSV values
    const escapeCSV = (value: string | number | undefined | null): string => {
        if (value === undefined || value === null) return '';
        const str = String(value);
        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    // Format date
    const formatDate = (timestamp: number): string => {
        return new Date(timestamp).toISOString();
    };

    // Convert lamports to XAND (divide by 1e9)
    const lamportsToXand = (lamports: number | undefined): string => {
        if (lamports === undefined) return '';
        return (lamports / 1e9).toFixed(2);
    };

    // Convert bytes to GB
    const bytesToGB = (bytes: number | undefined): string => {
        if (bytes === undefined) return '';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2);
    };

    // Generate rows
    const rows = nodes.map((node) => [
        escapeCSV(node.pubkey),
        escapeCSV(node.status),
        escapeCSV(node.healthScore),
        escapeCSV(node.operatorName),
        escapeCSV(node.network.host),
        escapeCSV(node.network.region),
        escapeCSV(node.network.geo?.lat),
        escapeCSV(node.network.geo?.lng),
        escapeCSV(node.versionInfo?.version),
        escapeCSV(lamportsToXand(node.stake?.stakedAmount)),
        escapeCSV(node.stake?.commissionRate),
        escapeCSV(bytesToGB(node.storage?.totalCapacityBytes)),
        escapeCSV(bytesToGB(node.storage?.usedBytes)),
        escapeCSV(node.performance?.performanceScore),
        escapeCSV(node.performance?.uptime24h?.toFixed(2)),
        escapeCSV(formatDate(node.lastSeenAt)),
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * Export pNode data to JSON format and trigger download.
 */
export function exportToJSON(nodes: PNode[], filename: string = 'xandeum-nodes.json'): void {
    const jsonContent = JSON.stringify(nodes, null, 2);

    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}
