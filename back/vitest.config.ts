/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "__tests__/units/**/*.test.ts",
      "__tests__/api/**/*.test.ts",
      "__tests__/trpc/**/*.test.ts",
    ],
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://user:password@localhost:5432/test?schema=public",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "**/*.test.ts",
        "**/*.d.ts",
        "**/__tests__/**",
        "**/node_modules/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
