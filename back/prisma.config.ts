import "dotenv/config";
import path from "node:path";

export default {
  schema: path.join(".prisma", "schema", "schema.prisma"),
  migrations: {
    path: path.join(".prisma", "migrations"),
  },
  datasource: {
    url: process.env.DATABASE_URL || process.env.PRISMA_ACCELERATE_URL,
  },
} as const;
