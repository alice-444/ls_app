"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
import { ChatWindow } from "@/components/messaging/ChatWindow";

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
    return <Loader />;
  }

  if (!conversationId) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Conversation ID manquant</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <ChatWindow conversationId={conversationId} />
    </div>
  );
}
