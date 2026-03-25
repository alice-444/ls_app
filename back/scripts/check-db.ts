import { PrismaClient } from './prisma/generated/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count();
  console.log(`Nombre d'utilisateurs : ${count}`);
  
  if (count > 0) {
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, email: true, name: true, role: true }
    });
    console.log('Premiers utilisateurs :', JSON.stringify(users, null, 2));
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
