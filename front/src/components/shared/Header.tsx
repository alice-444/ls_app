"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Coins, ShoppingCart, Crown, Menu } from "lucide-react";

import { ModeToggle } from "@/components/shared/ModeToggle";
import UserMenu from "@/components/shared/UserMenu";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { useSidebar } from "@/hooks/use-sidebar";

const REFETCH_INTERVALS = {
  CREDITS: 60000, // 60 seconds
} as const;

/** À activer quand le mode Premium sera prêt pour la prod */
const PREMIUM_ENABLED = false;

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleMobile } = useSidebar();
  const { data: session } = authClient.useSession();

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const { data: creditBalance } = trpc.credits.getBalance.useQuery(undefined, {
    enabled: !!session && userRole !== "ADMIN",
    refetchInterval: REFETCH_INTERVALS.CREDITS,
    trpc: {},
  });

  const shouldHideThemeToggle = pathname === "/login";

  const renderCreditsSection = () => {
    if (!session || creditBalance === undefined || userRole === "ADMIN") return null;

    return (
      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-1.5 md:gap-2 h-8 md:h-10 px-2 md:px-4 py-1 md:py-2 rounded-full bg-white/30 dark:bg-white/15 backdrop-blur-xl backdrop-saturate-150 border border-white/50 dark:border-white/30 shadow-[0_6px_20px_-4px_rgba(0,0,0,0.12),0_4px_8px_-2px_rgba(0,0,0,0.08),inset_0_2px_0_0_rgba(255,255,255,0.6)] dark:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.35),0_4px_8px_-2px_rgba(0,0,0,0.2),inset_0_2px_0_0_rgba(255,255,255,0.15)] transition-all duration-200 ease-out hover:bg-white/40 hover:border-white/60 hover:shadow-[0_10px_30px_-8px_rgba(0,0,0,0.15),0_6px_12px_-4px_rgba(0,0,0,0.1),inset_0_2px_0_0_rgba(255,255,255,0.7)] dark:hover:bg-white/20 dark:hover:border-white/40 dark:hover:shadow-[0_10px_30px_-8px_rgba(0,0,0,0.4),inset_0_2px_0_0_rgba(255,255,255,0.2)]">
          <span className="text-[#26547c] dark:text-[#5ba3ff] text-[10px] md:text-xs font-semibold whitespace-nowrap">
            999<span className="hidden sm:inline"> crédits</span>
          </span>
          <Coins className="w-3.5 md:w-[18px] h-3.5 md:h-[18px] text-[#26547c] dark:text-[#5ba3ff]" />
        </div>
        {userRole === "APPRENANT" && (
          <Button
            variant="ctaOutline"
            size="ctaSm"
            onClick={() => router.push("/buy-credits")}
            className="group"
            title="Acheter des crédits"
          >
            <span className="hidden lg:inline text-[#26547c] group-hover:text-white dark:text-[#e0e0e0] dark:group-hover:text-white text-xs font-semibold transition-colors duration-200">
              Acheter des crédits
            </span>
            <ShoppingCart className="w-4 lg:w-[18px] h-4 lg:h-[18px] text-[#26547c] group-hover:text-white dark:text-[#e0e0e0] dark:group-hover:text-white lg:ml-2 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Button>
        )}

        {PREMIUM_ENABLED && (
          <Button
            variant="cta"
            size="ctaSm"
            onClick={() => router.push("/premium")}
            className="group hidden md:flex"
            title="Obtenir la version Premium"
          >
            <span className="hidden lg:inline text-xs font-semibold">
              Obtenir la version Premium
            </span>
            <span className="lg:hidden text-xs font-semibold">Premium</span>
            <Crown className="w-4 lg:w-[18px] h-4 lg:h-[18px] ml-1 lg:ml-2 transition-transform duration-200 group-hover:translate-y-[-2px]" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-row items-center justify-between md:justify-end px-4 sm:px-6 md:px-8 py-4 md:py-6 lg:py-8 bg-background">
      {/* Mobile Menu & Logo */}
      <div className="flex items-center gap-4 md:hidden">
        <button
          onClick={toggleMobile}
          className="p-2 text-[#26547c] dark:text-[#e6e6e6] rounded-full bg-white/30 dark:bg-white/15 backdrop-blur-xl backdrop-saturate-150 border border-white/50 dark:border-white/30 shadow-[0_6px_20px_-4px_rgba(0,0,0,0.12),0_4px_8px_-2px_rgba(0,0,0,0.08),inset_0_2px_0_0_rgba(255,255,255,0.6)] dark:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.35),0_4px_8px_-2px_rgba(0,0,0,0.2),inset_0_2px_0_0_rgba(255,255,255,0.15)] hover:bg-white/45 dark:hover:bg-white/25 hover:shadow-[0_8px_25px_-6px_rgba(0,0,0,0.15),inset_0_2px_0_0_rgba(255,255,255,0.7)] transition-all"
          aria-label="Ouvrir le menu"
        >
          <Menu size={24} />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo/logo.png"
            alt="LearnSup Logo"
            width={32}
            height={32}
            className="shrink-0"
          />
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {renderCreditsSection()}
        {!shouldHideThemeToggle && <ModeToggle />}
        {session && <NotificationBell />}
        <UserMenu />
      </div>
    </div>
  );
}
