"use client";

import { useRouter, usePathname } from "next/navigation";
import { Coins, ShoppingCart, Crown } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { NotificationBell } from "./notification-bell";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";

const REFETCH_INTERVALS = {
  CREDITS: 60000, // 60 seconds
} as const;

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const shouldHideThemeToggle = pathname === "/login";

  const { data: creditBalance } = trpc.credits.getBalance.useQuery(undefined, {
    enabled: !!session && userRole !== "ADMIN",
    refetchInterval: REFETCH_INTERVALS.CREDITS,
    trpc: {},
  });

  const renderCreditsSection = () => {
    if (!session || creditBalance === undefined || userRole === "ADMIN") return null;

    return (
      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-1.5 md:gap-2 h-8 md:h-10 px-2 md:px-4 py-1 md:py-2 rounded-full bg-[#26547c]/10 backdrop-blur-md border border-[#26547c]/40 dark:bg-[#26547c]/15 dark:backdrop-blur-lg dark:border-[#4a90e2]/50 shadow-sm transition-all duration-200 ease-out hover:bg-[#26547c]/18 hover:border-[#26547c]/55 hover:shadow hover:-translate-y-px dark:hover:bg-[#26547c]/22 dark:hover:border-[#4a90e2]/65">
          <span className="text-[#26547c] dark:text-[#5ba3ff] text-[10px] md:text-xs font-semibold whitespace-nowrap">
            {creditBalance.balance}
            <span className="hidden sm:inline"> crédits</span>
          </span>
          <Coins className="w-3.5 md:w-[18px] h-3.5 md:h-[18px] text-[#26547c] dark:text-[#5ba3ff]" />
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/buy-credits")}
          className="group h-8 md:h-10 px-2 md:px-4 py-1 md:py-2 rounded-full border border-[#26547c]/50 bg-white/80 backdrop-blur-md dark:bg-white/10 dark:backdrop-blur-lg dark:border-[#4a90e2]/50 dark:text-[#e0e0e0] transition-all duration-200 ease-out hover:bg-[#26547c] hover:border-[#26547c] hover:shadow-md hover:-translate-y-px active:translate-y-0 dark:hover:bg-[#4a90e2] dark:hover:border-[#4a90e2]"
          title="Acheter des crédits"
        >
          <span className="hidden lg:inline text-[#26547c] group-hover:text-white dark:text-[#e0e0e0] dark:group-hover:text-white text-xs font-semibold transition-colors duration-200">
            Acheter des crédits
          </span>
          <ShoppingCart className="w-4 lg:w-[18px] h-4 lg:h-[18px] text-[#26547c] group-hover:text-white dark:text-[#e0e0e0] dark:group-hover:text-white lg:ml-2 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Button>

        <Button
          onClick={() => router.push("/premium")}
          className="group hidden md:flex h-8 md:h-10 px-2 md:px-4 py-1 md:py-2 rounded-full bg-[#FFB647]/90 backdrop-blur-md border border-[#FFB647]/60 dark:bg-[#FFB647]/80 dark:backdrop-blur-lg dark:border-[#FFB647]/50 text-black transition-all duration-200 ease-out shadow-md hover:bg-[#ff9f1a] hover:border-[#FFB647]/80 hover:shadow-md hover:-translate-y-px active:translate-y-0 dark:hover:bg-[#ff9f1a] dark:hover:border-[#FFB647]/80"
          title="Obtenir la version Premium"
        >
          <span className="hidden lg:inline text-xs font-semibold">
            Obtenir la version Premium
          </span>
          <span className="lg:hidden text-xs font-semibold">Premium</span>
          <Crown className="w-4 lg:w-[18px] h-4 lg:h-[18px] ml-1 lg:ml-2 transition-transform duration-200 group-hover:translate-y-[-2px]" />
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
