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
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <div className="inline-block">
          <div className="relative">
            <div
              className="bg-[#26547c] dark:bg-[#1a1720] text-white dark:text-[#e6e6e6] px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-tl-lg rounded-tr-[24px] sm:rounded-tr-[36px] rounded-bl-[24px] sm:rounded-bl-[36px] rounded-br-lg"
              style={{
                transform: "rotate(-0.4deg)",
              }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
                Mes conversations
              </h1>
            </div>
          </div>
        </div>
        <p className="text-[#161616] dark:text-[#e6e6e6] text-base sm:text-xl md:text-2xl mt-4 sm:mt-6">
          Gère tes conversations & messages
        </p>
      </div>
      <ConversationList />
    </div>
  );
}
