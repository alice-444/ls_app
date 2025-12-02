"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface WorkshopCreatorCardProps {
  creator: {
    id: string;
    user?: {
      name?: string | null;
    } | null;
    bio?: string | null;
  };
}

export function WorkshopCreatorCard({ creator }: WorkshopCreatorCardProps) {
  const router = useRouter();

  if (!creator) return null;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/mentors/${creator.id}`)}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Professeur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold">
            {creator.user?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100 hover:underline">
              {creator.user?.name || "Animateur"}
            </p>
          </div>
        </div>
        {creator.bio && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            {creator.bio}
          </p>
        )}
        <p className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-medium">
          Voir le profil complet <ArrowRight className="w-4 h-4 ml-2" />
        </p>
      </CardContent>
    </Card>
  );
}
