import { PrismaClient } from "./generated/client/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

export const authPrisma = new PrismaClient();

export default prisma;
