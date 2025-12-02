import { PrismaClient } from "./prisma/generated/client/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Instance principale de Prisma
const createPrismaClient = (): PrismaClient => {
  const useAccelerate = !!process.env.PRISMA_ACCELERATE_URL;

  if (useAccelerate) {
    return new PrismaClient({
      accelerateUrl: process.env.PRISMA_ACCELERATE_URL!,
      log:
        process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } else {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "Either PRISMA_ACCELERATE_URL or DATABASE_URL environment variable must be set"
      );
    }
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20,
      // Désactive la vérification SSL en développement
      ssl:
        process.env.NODE_ENV === "development"
          ? { rejectUnauthorized: false }
          : undefined,
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
};

// Instance principale pour l'application
export const prisma = createPrismaClient();

// Instance séparée pour l'authentification (better-auth)
export const authPrisma = createPrismaClient();

export default prisma;
