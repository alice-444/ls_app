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
    // 1. Trouver l'utilisateur par email (table user, pas account)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      console.error(`Utilisateur avec l'email ${email} non trouvé.`);
      return;
    }

    // 2. Mettre à jour le rôle
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    console.log(`Succès ! L'utilisateur ${email} est maintenant ADMIN.`);
  } catch (error) {
    console.error("Erreur lors de la promotion admin :", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
