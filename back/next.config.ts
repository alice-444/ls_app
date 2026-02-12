import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Utiliser un répertoire de build différent si NEXT_STANDALONE est défini (pour next dev)
  distDir: process.env.NEXT_STANDALONE === "true" ? ".next-standalone" : ".next",
  // Disable static generation for API routes to avoid build-time errors
  staticPageGenerationTimeout: undefined,
  async headers() {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    return [
      {
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: frontendUrl },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
