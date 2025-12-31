-- CreateTable
CREATE TABLE "conversation_pin" (
    "_id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "appUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_pin_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE INDEX "conversation_pin_conversationId_idx" ON "conversation_pin"("conversationId");

-- CreateIndex
CREATE INDEX "conversation_pin_appUserId_idx" ON "conversation_pin"("appUserId");

-- CreateIndex
CREATE INDEX "conversation_pin_createdAt_idx" ON "conversation_pin"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_pin_conversationId_appUserId_key" ON "conversation_pin"("conversationId", "appUserId");

-- AddForeignKey
ALTER TABLE "conversation_pin" ADD CONSTRAINT "conversation_pin_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_pin" ADD CONSTRAINT "conversation_pin_appUserId_fkey" FOREIGN KEY ("appUserId") REFERENCES "app_user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

