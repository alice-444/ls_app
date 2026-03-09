import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Creating initial admin user...');

  const accountId = 'admin-123';
  const email = 'admin@learnsup.com';

  // Create account first (required for user relation)
  const account = await prisma.account.upsert({
    where: { accountId },
    update: {},
    create: {
      id: accountId,
      accountId,
      email,
      isEmailVerified: true,
      failedLoginAttempts: 0,
      isLocked: false,
      lastLogin: new Date(),
    }
  });

  // Create user
  await prisma.user.upsert({
    where: { userId: accountId },
    update: { role: 'ADMIN', status: 'ACTIVE' },
    create: {
      userId: accountId,
      name: 'Admin Solidarity',
      email,
      role: 'ADMIN',
      status: 'ACTIVE',
    }
  });

  console.log('Admin user created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
