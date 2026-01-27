"use client";

import { useRouter, usePathname } from "next/navigation";
import { Coins, ShoppingCart, Crown } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { NotificationBell } from "./notification-bell";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

const REFETCH_INTERVALS = {
  CREDITS: 60000, // 60 seconds
} as const;

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const shouldHideThemeToggle = pathname === "/login";

  const { data: creditBalance } = trpc.credits.getBalance.useQuery(undefined, {
    enabled: !!session,
    refetchInterval: REFETCH_INTERVALS.CREDITS,
    trpc: {},
  });

  const renderCreditsSection = () => {
    if (!session || creditBalance === undefined) return null;

    return (
      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-1.5 md:gap-2 h-8 md:h-10 px-2 md:px-4 py-1 md:py-2 rounded-full bg-[#26547c]/10 border border-[#26547c] dark:bg-[#26547c]/20 dark:border-[#4a90e2]">
          <span className="text-[#26547c] dark:text-[#5ba3ff] text-[10px] md:text-xs font-semibold whitespace-nowrap">
            {creditBalance.balance}
            <span className="hidden sm:inline"> crédits</span>
          </span>
          <Coins className="w-3.5 md:w-[18px] h-3.5 md:h-[18px] text-[#26547c] dark:text-[#5ba3ff]" />
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/buy-credits")}
          className="group h-8 md:h-10 px-2 md:px-4 py-1 md:py-2 rounded-full border-2 border-[#26547c] bg-white hover:bg-[#26547c] dark:bg-gray-900 dark:border-[#4a90e2] dark:hover:bg-[#4a90e2] dark:text-[#e0e0e0] transition-all duration-200 hover:shadow-lg"
          title="Acheter des crédits"
        >
          <span className="hidden lg:inline text-[#26547c] group-hover:text-white dark:text-[#e0e0e0] dark:group-hover:text-white text-xs font-semibold transition-colors">
            Acheter des crédits
          </span>
          <ShoppingCart className="w-4 lg:w-[18px] h-4 lg:h-[18px] text-[#26547c] group-hover:text-white dark:text-[#e0e0e0] dark:group-hover:text-white lg:ml-2 transition-colors" />
        </Button>

        <Button
          onClick={() => router.push("/premium")}
          className="hidden md:flex h-8 md:h-10 px-2 md:px-4 py-1 md:py-2 rounded-full bg-[#FFB647] hover:bg-[#ff9f1a] border-2 border-[#FFB647] text-black dark:bg-[#FFB647] dark:hover:bg-[#ff9f1a] dark:text-black transition-all shadow-md hover:shadow-lg"
          title="Obtenir la version Premium"
        >
          <span className="hidden lg:inline text-xs font-semibold">
            Obtenir la version Premium
          </span>
          <span className="lg:hidden text-xs font-semibold">Premium</span>
          <Crown className="w-4 lg:w-[18px] h-4 lg:h-[18px] ml-1 lg:ml-2" />
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-row items-center justify-end px-4 sm:px-6 md:px-8 py-4 md:py-6 lg:py-8 bg-transparent">
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {renderCreditsSection()}
        {!shouldHideThemeToggle && <ModeToggle />}
        {session && <NotificationBell />}
        <UserMenu />
      </div>
    </div>
  );
}
