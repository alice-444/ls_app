"use client";

import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-server-client";
import { PageContainer } from "@/components/shared/layout";
import { ChatWindow } from "@/components/domains/messaging/ChatWindow";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/shared/BackButton";
import { motion } from "framer-motion";

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  if (isSessionPending) {
    return (
      <PageContainer>
        <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand" />
          <p className="text-ls-muted">Chargement...</p>
        </div>
      </PageContainer>
    );
  }

  if (!conversationId) {
    return (
      <PageContainer>
        <motion.div
          className="border border-border/50 bg-card/95 backdrop-blur-md rounded-2xl p-12 text-center shadow-xl"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-brand/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-10 w-10 text-brand" />
          </div>
          <h2 className="text-2xl font-bold text-ls-heading mb-2">
            Conversation introuvable
          </h2>
          <p className="text-ls-muted mb-6 max-w-md mx-auto">
            L'identifiant de conversation est manquant ou invalide.
          </p>
          <Button
            onClick={() => router.push("/inbox")}
            variant="cta" size="cta" className="px-6"
          >
            Retour aux conversations
          </Button>
        </motion.div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div
        className="h-[calc(100vh-160px)] flex flex-col"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <BackButton href="/inbox" label="Retour aux conversations" />

        <div className="flex-1 border border-border/50 bg-card/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl min-h-0">
          <ChatWindow conversationId={conversationId} />
        </div>
      </motion.div>
    </PageContainer>
  );
}
