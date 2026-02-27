import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "__tests__/units/**/*.test.ts",
      "__tests__/api/**/*.test.ts",
    ],
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://user:password@localhost:5432/test?schema=public",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
