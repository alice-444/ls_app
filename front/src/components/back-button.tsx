import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  readonly href: string;
  readonly label?: string;
}

export function BackButton({
  href,
  label = "Retour",
}: Readonly<BackButtonProps>) {
  return (
    <div className="mb-4">
      <Link href={href}>
        <Button
          variant="ghost"
          className="group relative flex items-center gap-3 text-[#26547c] dark:text-[#e6e6e6] hover:text-[#FF8C42] dark:hover:text-[#FF8C42] transition-all duration-300 rounded-full px-3 py-2 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF8C42]/0 via-[#FF8C42]/0 to-[#FF8C42]/0 group-hover:from-[#FF8C42]/5 group-hover:via-[#FF8C42]/10 group-hover:to-[#FF8C42]/5 dark:group-hover:from-[#FF8C42]/10 dark:group-hover:via-[#FF8C42]/15 dark:group-hover:to-[#FF8C42]/10 transition-all duration-300 rounded-full" />

          <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/10 dark:to-white/5 group-hover:from-[#FF8C42]/20 group-hover:to-[#FF8C42]/10 dark:group-hover:from-[#FF8C42]/30 dark:group-hover:to-[#FF8C42]/20 transition-all duration-300 flex items-center justify-center shadow-sm group-hover:shadow-md">
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
          </div>

          <span className="relative z-10 text-base font-semibold transition-all duration-300">
            {label}
          </span>
        </Button>
      </Link>
    </div>
  );
}
