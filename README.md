# 🚀 Xandeum Network Monitor

> **Real-time analytics platform for the Xandeum Storage Network**  
> Featuring global node mapping, latency tracking, and health monitoring.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌍 **Global Distribution Map** | Visualizes approximate pNode locations using GeoIP resolution (Leaflet) |
| ⚡ **Near Real-Time Monitoring** | Auto-refreshes data every 30 seconds via RPC gossip |
| 📊 **Network Activity Chart** | 24-hour latency trends (simulated, as pNode network doesn't archive metrics) |
| 🔍 **Smart Filtering** | Filter nodes by status (Online/Offline/Degraded) and software version |
| 📋 **Detailed Node View** | Click any node to see full network info, software version, and raw JSON |
| 🛡️ **Resilient Architecture** | Graceful fallback to mock data if RPC is unavailable |

---

## 🖼️ Screenshots

### Main Dashboard
![Main Dashboard](/public/screenshots/dashboard-main.png)

### Node Detail Sheet
![Node Detail](/public/screenshots/node-detail.png)


---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/AJ-EN/xandeum-pnode-dashboard.git
cd xandeum-pnode-dashboard

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Configuration

Create a `.env.local` file in the root directory:

```env
# Xandeum pRPC Endpoint
# Devnet (recommended for testing):
XANDEUM_PRPC_URL=https://api.devnet.xandeum.com:8899

# Mainnet (when available):
# XANDEUM_PRPC_URL=https://rpc.xandeum.network
```

> **Note:** If no URL is configured, the dashboard will display realistic mock data for demonstration purposes.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/pnodes/       # API route for pNode data
│   ├── page.tsx          # Main dashboard page
│   └── globals.css       # Global styles + Leaflet fixes
├── components/dashboard/
│   ├── stats-grid.tsx    # Network statistics cards
│   ├── node-table.tsx    # Filterable node table
│   ├── node-detail-sheet.tsx  # Slide-out node details
│   ├── activity-chart.tsx     # Recharts latency graph
│   ├── network-map.tsx   # Leaflet world map
│   └── map-wrapper.tsx   # SSR-safe map loader
├── hooks/
│   └── use-pnodes.ts     # Data fetching hook with auto-refresh
├── lib/
│   └── prpc.ts           # pRPC client with GeoIP enrichment
└── types/
    └── pnode.ts          # TypeScript interfaces
```

### Data Flow

1. **`usePNodes` hook** → Fetches from `/api/pnodes` every 30 seconds
2. **API Route** → Calls `fetchPNodes()` from `prpc.ts`
3. **pRPC Client** → Calls `getClusterNodes` on Xandeum RPC
4. **GeoIP Enrichment** → Batch resolves IPs to lat/lng coordinates
5. **Dashboard** → Renders real-time data with auto-refresh

---

## 📡 API Reference

### `GET /api/pnodes`

Returns all pNodes currently visible in gossip.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "pubkey": "G5QXt6hybXuiHjaN...",
      "status": "online",
      "isActive": true,
      "healthScore": 100,
      "network": {
        "host": "192.190.136.35",
        "gossipPort": 8000,
        "prpcPort": 8899,
        "region": "Iowa",
        "geo": { "lat": 41.55, "lng": -90.48 }
      },
      "versionInfo": {
        "version": "2.2.0-7c3f39e8",
        "featureSet": 3294202862,
        "shredVersion": 48698
      }
    }
  ],
  "count": 17,
  "timestamp": "2024-12-22T10:30:00.000Z"
}
```

---

## 🎨 Design Philosophy

- **Clarity over complexity** — Information is scannable at a glance
- **Dark theme** — Matches the Solana ecosystem aesthetic
- **Resilient by default** — Mock data ensures the dashboard always works
- **Mobile-first** — Responsive design for all screen sizes

---

## 🔧 Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe development |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [Recharts](https://recharts.org/) | Data visualization |
| [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/) | Interactive maps |
| [ip-api.com](https://ip-api.com/) | GeoIP resolution |

---

## 📝 Notes for Judges

1. **Real Data** — The dashboard fetches live pNode data from `getClusterNodes` on the Xandeum devnet
2. **GeoIP** — Node locations are resolved from IP addresses using ip-api.com's batch endpoint
3. **Simulated Chart** — The activity chart generates projected data based on current node stats, as the pNode network doesn't archive historical metrics
4. **Mock Fallback** — If the RPC is unavailable, the dashboard gracefully displays realistic mock data

---

<div align="center">
  <strong>Built for the Xandeum Superteam Bounty 🏆</strong>
</div>
