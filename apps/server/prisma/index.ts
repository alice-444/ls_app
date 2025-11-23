import { PrismaClient } from "./generated/client/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export const authPrisma = new PrismaClient({ adapter });

export default prisma;
