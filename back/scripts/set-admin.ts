import * as path from "path";
import * as dotenv from "dotenv";

// Load .env before importing prisma (which reads DATABASE_URL)
dotenv.config({ path: path.join(__dirname, "../.env") });

import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Veuillez fournir un email : npx tsx scripts/set-admin.ts user@example.com");
    process.exit(1);
  }

  try {
    // 1. Trouver l'utilisateur par email
    const account = await prisma.account.findUnique({
      where: { email },
      include: { user: true }
    });

    if (!account) {
      console.error(`Compte avec l'email ${email} non trouvé.`);
      return;
    }

    // 2. Mettre à jour ou créer l'user avec le rôle ADMIN
    if (account.user) {
      await prisma.user.update({
        where: { userId: account.accountId },
        data: { 
          role: "ADMIN",
          status: "ACTIVE" 
        }
      });
    } else {
      await prisma.user.create({
        data: {
          id: `admin_${account.accountId}`,
          userId: account.accountId,
          name: "Admin User",
          email: account.email || `${account.accountId}@learnsup.com`,
          role: "ADMIN",
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    console.log(`Succès ! L'utilisateur ${email} est maintenant ADMIN.`);
  } catch (error) {
    console.error("Erreur lors de la promotion admin :", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
