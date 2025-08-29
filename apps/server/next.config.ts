import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		turbo: false,
	},
	async headers() {
		return [
			{
				source: "/api/(.*)",
				headers: [
					{ key: "Access-Control-Allow-Credentials", value: "true" },
					{ key: "Access-Control-Allow-Origin", value: "http://localhost:3001" },
					{ key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
					{ key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
				],
			},
		];
	},
};

export default nextConfig;
