"use client";

import { authClient } from "@/lib/auth-server-client";
import { PageContainer } from "@/components/shared/layout";
import ShinyText from "@/components/ui/ShinyText";
import { motion } from "framer-motion";
import { ConversationList } from "@/components/domains/messaging/ConversationList";

export default function InboxPage() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  if (isSessionPending) {
    return (
      <PageContainer>
        <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand" />
          <p className="text-ls-muted">Chargement de tes conversations...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div
        className="mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          <ShinyText text="Mes conversations" />
        </h1>
        <p className="text-base sm:text-lg text-ls-muted mt-2">
          Gère tes conversations et tes messages
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <ConversationList />
      </motion.div>
    </PageContainer>
  );
}
