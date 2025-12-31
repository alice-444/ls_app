"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
import { ChatWindow } from "@/components/messaging/ChatWindow";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/back-button";

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  useEffect(() => {
    if (!session && !isSessionPending) {
      router.push("/login");
    }
  }, [session, isSessionPending, router]);

  if (isSessionPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        <div className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] rounded-2xl p-12 text-center animate-in fade-in duration-500">
          <div className="bg-gray-100 dark:bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#26547c] dark:text-[#e6e6e6] mb-2">
            Conversation introuvable
          </h2>
          <p className="text-gray-600 dark:text-[rgba(230,230,230,0.64)] mb-6 max-w-md mx-auto">
            L'identifiant de conversation est manquant ou invalide
          </p>
          <Button
            onClick={() => router.push("/inbox")}
            className="bg-[#ffb647] hover:bg-[#ff9f1a] text-[#161616] rounded-full px-6 shadow-md hover:shadow-lg transition-all"
          >
            Retour aux conversations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-3 max-w-7xl h-[calc(100vh-160px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
ƒ      <BackButton href="/inbox" label="Retour aux conversations" />

      <div className="flex-1 bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 min-h-0">
        <ChatWindow conversationId={conversationId} />
      </div>
    </div>
  );
}
