import { withSentryConfig } from "@sentry/nextjs";
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
																};
export default withSentryConfig(nextConfig, {
 // For all available options, see:
	// https://www.npmjs.com/package/@sentry/webpack-plugin#options

	org: "hola-solar",

 project: "learnsup",

 // Only print logs for uploading source maps in CI
	silent: !process.env.CI,

 // For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

 // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
	// side errors will fail.
	tunnelRoute: "/monitoring",

 webpack: {
			// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
			// See the following for more information:
			// https://docs.sentry.io/product/crons/
			// https://vercel.com/docs/cron-jobs
			automaticVercelMonitors: true,

			// Tree-shaking options for reducing bundle size
			treeshake: {
					// Automatically tree-shake Sentry logger statements to reduce bundle size
					removeDebugLogging: true,
			},
	},
});
