"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface WorkshopCreatorCardProps {
  readonly creator: {
    readonly id: string;
    readonly user?: {
      readonly name?: string | null;
    } | null;
    readonly bio?: string | null;
  };
}

export function WorkshopCreatorCard({
  creator,
}: Readonly<WorkshopCreatorCardProps>) {
  const router = useRouter();

  if (!creator) return null;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px]"
      onClick={() => router.push(`/mentors/${creator.id}`)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-[#26547c] dark:text-[#e6e6e6] text-lg">
          <User className="w-5 h-5" />
          Mentor
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#26547c] to-[#4A90E2] flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {creator.user?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base text-[#26547c] dark:text-[#e6e6e6] hover:underline mb-1">
              {creator.user?.name || "Mentor"}
            </p>
            {creator.bio && (
              <p className="text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)] line-clamp-2">
                {creator.bio}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          className="w-full mt-3 border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] bg-white dark:bg-[rgba(255,255,255,0.08)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] font-semibold flex items-center justify-center gap-2 rounded-[32px] py-2.5 px-4 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffb647] focus:ring-offset-2"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/mentors/${creator.id}`);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/mentors/${creator.id}`);
            }
          }}
        >
          Voir le profil complet
          <ArrowRight className="w-4 h-4" />
        </button>
      </CardContent>
    </Card>
  );
}
