"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/loader";
import { ConversationList } from "@/components/messaging/ConversationList";

export default function InboxPage() {
  const router = useRouter();
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Boîte de réception</h1>
        <p className="text-muted-foreground mt-2">
          Gérez vos conversations et messages
        </p>
      </div>
      <ConversationList />
    </div>
  );
}
