"use client";

import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Calendar, Users, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatTime } from "@/lib/workshop-utils";

interface MentorWorkshopsListProps {
  mentorId: string;
}

export function MentorWorkshopsList({ mentorId }: Readonly<MentorWorkshopsListProps>) {
  const { data: workshopsData, isLoading } = trpc.mentor.getPublicWorkshops.useQuery({ mentorId });

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Chargement des ateliers...</div>;
  }

  const upcomingWorkshops = workshopsData?.upcoming || [];

  if (upcomingWorkshops.length === 0) {
    return (
      <div className="text-center py-8 bg-card/50 border-2 border-dashed border-border/50 rounded-2xl">
        <p className="text-ls-muted font-medium">Ce mentor n&apos;a pas encore d&apos;ateliers à venir publiés.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {upcomingWorkshops.map((workshop: any) => (
        <Card key={workshop.id} className="hover:border-brand/30 transition-all border-border/50 bg-card/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl group">
          <CardHeader className="p-6 pb-2">
            <div className="flex justify-between items-start gap-4">
              <CardTitle className="text-lg font-bold text-ls-heading group-hover:text-brand transition-colors leading-tight">
                {workshop.title}
              </CardTitle>
              <Badge variant="secondary" className="bg-brand/10 text-brand border-none text-[10px] uppercase tracking-wider font-bold shrink-0 rounded-full">
                {workshop.domain}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-ls-muted text-xs mt-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand" />
                {formatDate(workshop.date)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand" />
                {formatTime(workshop.time)}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-brand" />
                {workshop.maxParticipants} places
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <p className="text-sm text-ls-muted line-clamp-2 mb-6 min-h-[40px]">
              {workshop.description}
            </p>
            <Button asChild variant="cta" size="cta" className="w-full font-bold h-11">
              <Link href={`/workshop/${workshop.id}`}>
                Détails de l'atelier <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
