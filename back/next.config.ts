import type { NextConfig } from "next";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Chemin du module WASM Prisma (résolution pour webpack et Turbopack)
const prismaWasmPath = path.join(
	path.dirname(require.resolve("@prisma/client/package.json")),
	"runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs",
);
// Relatif au projet (back/) pour Turbopack, qui n’accepte pas les chemins absolus
const prismaWasmPathRelative = path
	.relative(process.cwd(), prismaWasmPath)
	.replaceAll(path.sep, "/");

const nextConfig: NextConfig = {
	// Utiliser un répertoire de build différent si NEXT_STANDALONE est défini (pour next dev)
	distDir: process.env.NEXT_STANDALONE === "true" ? ".next-standalone" : ".next",
	// Ne pas bundler Prisma : résolu à l’exécution par Node
	serverExternalPackages: ["@prisma/client", "prisma"],
	turbopack: {
		resolveAlias: {
			"@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs":
				prismaWasmPathRelative,
		},
	},
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.resolve ??= {};
			config.resolve.alias = {
				...config.resolve.alias,
				"@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs":
					prismaWasmPath,
			};
		}
		return config;
	},
	async headers() {
		return [
			{
				source: "/api/(.*)",
				headers: [
					{ key: "Access-Control-Allow-Credentials", value: "true" },
					{ key: "Access-Control-Allow-Origin", value: "http://localhost:3001" },
					{ key: "Access-Control-Allow-Methods", value: "GET,POST,DELETE,OPTIONS" },
					{ key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
				],
			},
		];
	},
};

export default nextConfig;
