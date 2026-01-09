import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {},
  // Removed outputFileTracingRoot to avoid nested standalone structure in Docker
  // The backend files are already copied in the Dockerfile, so this isn't needed
};

export default nextConfig;
