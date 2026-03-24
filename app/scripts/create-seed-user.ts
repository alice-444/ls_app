import { prisma } from '../src/lib/common/prisma';

async function main() {
  console.log('Creating initial admin user...');

  const accountId = 'admin-123';
  const email = 'admin@learnsup.com';

  // Create user with nested account (cleaner and respects relations)
  await prisma.user.upsert({
    where: { email },
    update: { 
      role: 'ADMIN', 
      status: 'ACTIVE',
      userId: accountId // Ensure business ID is set
    },
    create: {
      id: accountId,
      userId: accountId,
      name: 'Admin LearnSup',
      email,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      accounts: {
        create: {
          accountId: accountId,
          email: email,
          isEmailVerified: true,
          providerId: 'credential',
        }
      }
    }
  });

  console.log('Admin user and account created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
