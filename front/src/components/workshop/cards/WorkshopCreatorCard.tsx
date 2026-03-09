"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface WorkshopCreatorCardProps {
  readonly creator: {
    readonly id: string;
    readonly name?: string | null;
    readonly displayName?: string | null;
    readonly photoUrl?: string | null;
    readonly bio?: string | null;
  };
}

export function WorkshopCreatorCard({
  creator,
}: Readonly<WorkshopCreatorCardProps>) {
  const router = useRouter();

  if (!creator) return null;

  const mentorName = creator.displayName || creator.name || "Mentor";
  const initials = mentorName.charAt(0).toUpperCase() || "?";

  return (
    <Card
      className="cursor-pointer hover:shadow-xl transition-all bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl"
      onClick={() => router.push(`/mentors/${creator.id}`)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-ls-heading text-lg">
          <User className="w-5 h-5" />
          Mentor
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-start gap-3 mb-3">
          {creator.photoUrl ? (
            <img 
              src={creator.photoUrl} 
              alt={mentorName} 
              className="w-10 h-10 rounded-full object-cover shrink-0" 
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#26547c] to-[#4A90E2] flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base text-ls-heading hover:underline mb-1">
              {mentorName}
            </p>
            {creator.bio && (
              <p className="text-sm text-ls-muted line-clamp-2">
                {creator.bio}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          className="w-full mt-3 border border-border bg-card/80 text-ls-heading hover:bg-brand-soft hover:border-brand font-semibold flex items-center justify-center gap-2 rounded-full py-2.5 px-4 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
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
