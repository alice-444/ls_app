-- AlterTable: Add account.userId and account.providerId for Better Auth compatibility
-- Step 1: Add new columns as nullable
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "providerId" TEXT DEFAULT 'credential';

-- Step 2: Populate userId from existing user records (user.userId = account.accountId)
UPDATE "account" a
SET "userId" = u.id
FROM "user" u
WHERE u."userId" = a."accountId";

-- Step 3: Make columns required (fail if any nulls remain)
ALTER TABLE "account" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "account" ALTER COLUMN "providerId" SET NOT NULL;
ALTER TABLE "account" ALTER COLUMN "providerId" DROP DEFAULT;

-- Step 4: Add default for providerId on new rows
ALTER TABLE "account" ALTER COLUMN "providerId" SET DEFAULT 'credential';

-- Step 5: Make user.userId optional (drop NOT NULL)
ALTER TABLE "user" ALTER COLUMN "userId" DROP NOT NULL;

-- Step 6: Drop old FK (user.userId -> account.accountId)
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "user_userId_fkey";

-- Step 7: Add new FK (account.userId -> user.id)
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 8: Create index on account.userId
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account"("userId");
