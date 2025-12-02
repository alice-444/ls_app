import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: '../../',
  typescript: {
    // Ignore TypeScript errors during build (for monorepo cross-imports)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
