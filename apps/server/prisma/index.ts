import { PrismaClient } from "./generated/client/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const useAccelerate = !!process.env.PRISMA_ACCELERATE_URL;

let prisma: ReturnType<typeof createPrismaClient>;
let authPrisma: PrismaClient;

function createPrismaClient() {
  if (useAccelerate) {
    return new PrismaClient({
      accelerateUrl: process.env.PRISMA_ACCELERATE_URL!,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    }).$extends(withAccelerate());
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
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
}

prisma = createPrismaClient();

if (useAccelerate) {
  authPrisma = new PrismaClient({
    accelerateUrl: process.env.PRISMA_ACCELERATE_URL!,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
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
  });
  const adapter = new PrismaPg(pool);
  authPrisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export { authPrisma };
export default prisma;
