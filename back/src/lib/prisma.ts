import path from "node:path";
import { config } from "dotenv";

// Charger .env depuis le répertoire back/ (indépendant du cwd)
config({ path: path.resolve(__dirname, "../../.env") });

export * from "../../prisma/generated/client/client";
import { PrismaClient } from "../../prisma/generated/client/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy";

// Un seul pool de connexions pour toute l'application
export const pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10, // Réduit à 10 pour être sûr de ne pas saturer la DB
  ssl:
    process.env.NODE_ENV === "development"
      ? { rejectUnauthorized: false }
      : undefined,
});

const adapter = new PrismaPg(pool);

// Instance unique de Prisma
export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

export default prisma;
