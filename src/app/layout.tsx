import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Xandeum Network Monitor | pNode Analytics Dashboard",
  description: "Real-time analytics dashboard for Xandeum pNodes. Monitor network health, storage metrics, and node performance across the decentralized storage network.",
  keywords: ["Xandeum", "pNode", "Solana", "blockchain", "storage", "analytics", "dashboard"],
  authors: [{ name: "Xandeum Labs" }],
  openGraph: {
    title: "Xandeum Network Monitor",
    description: "Real-time pNode analytics dashboard for the Xandeum storage network",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xandeum Network Monitor",
    description: "Real-time pNode analytics dashboard",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
