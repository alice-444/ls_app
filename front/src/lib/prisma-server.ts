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
  connectionTimeoutMillis: 20000, // Plus de temps pour la prod
  idleTimeoutMillis: 60000,       // Garder les connexions plus longtemps
  max: 20,                         // Augmenter légèrement pour absorber les pics
  ssl:
    process.env.NODE_ENV === "development"
      ? { rejectUnauthorized: false }
      : undefined,
});

// CRITICAL: Éviter que le pool ne crashe le processus lors d'une rupture réseau
pool.on("error", (err) => {
  console.error("Unexpected error on idle pg client", err);
});

const adapter = new PrismaPg(pool);

// Instance unique de Prisma
export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

export default prisma;
