import * as path from "path";
import * as dotenv from "dotenv";

// Load .env before importing prisma (which reads DATABASE_URL)
dotenv.config({ path: path.join(__dirname, "../.env") });

import { prisma } from "../prisma";

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Veuillez fournir un email : npx tsx scripts/set-admin.ts user@example.com");
    process.exit(1);
  }

  try {
    // 1. Trouver l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { app_user: true }
    });

    if (!user) {
      console.error(`Utilisateur avec l'email ${email} non trouvé.`);
      return;
    }

    // 2. Mettre à jour ou créer l'app_user avec le rôle ADMIN
    if (user.app_user) {
      await prisma.app_user.update({
        where: { userId: user.id },
        data: { 
          role: "ADMIN",
          status: "ACTIVE" 
        }
      });
    } else {
      await prisma.app_user.create({
        data: {
          id: `admin_${user.id}`,
          userId: user.id,
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
