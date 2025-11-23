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
    }).$extends(withAccelerate());
  } else {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "Either PRISMA_ACCELERATE_URL or DATABASE_URL environment variable must be set"
      );
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }
}

prisma = createPrismaClient();

if (useAccelerate) {
  authPrisma = new PrismaClient({
    accelerateUrl: process.env.PRISMA_ACCELERATE_URL!,
  });
} else {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "Either PRISMA_ACCELERATE_URL or DATABASE_URL environment variable must be set"
    );
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  authPrisma = new PrismaClient({ adapter });
}

export { authPrisma };
export default prisma;
