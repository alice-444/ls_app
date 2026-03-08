"use client";

import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Tag, Users, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/workshop-utils";

interface MentorWorkshopsListProps {
  mentorId: string;
}

export function MentorWorkshopsList({ mentorId }: MentorWorkshopsListProps) {
  const { data: workshopsData, isLoading } = trpc.mentor.getPublicWorkshops.useQuery({ mentorId });

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Chargement des ateliers...</div>;
  }

  const upcomingWorkshops = workshopsData?.upcoming || [];

  if (upcomingWorkshops.length === 0) {
    return (
      <div className="text-center py-8 bg-ls-bg/50 border-2 border-dashed border-ls-border rounded-3xl">
        <p className="text-ls-text-light font-medium">Ce mentor n'a pas encore d'ateliers à venir publiés.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {upcomingWorkshops.map((workshop: any) => (
        <Card key={workshop.id} className="hover:border-ls-blue/30 transition-all border-ls-border bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md group">
          <CardHeader className="p-6 pb-2">
            <div className="flex justify-between items-start gap-4">
              <CardTitle className="text-lg font-black text-ls-heading group-hover:text-ls-blue transition-colors leading-tight">
                {workshop.title}
              </CardTitle>
              <Badge variant="secondary" className="bg-ls-blue/10 text-ls-blue border-none text-[10px] uppercase tracking-wider font-bold shrink-0">
                {workshop.domain}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-ls-text-light text-xs mt-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-ls-blue" />
                {formatDate(workshop.date)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-ls-blue" />
                {formatTime(workshop.time)}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-ls-blue" />
                {workshop.maxParticipants} places
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <p className="text-sm text-ls-text-light line-clamp-2 mb-6 min-h-[40px]">
              {workshop.description}
            </p>
            <Button asChild className="w-full bg-ls-blue hover:bg-ls-blue/90 text-white font-bold h-11 rounded-full shadow-lg shadow-ls-blue/20">
                <Link href={`/workshops/${workshop.id}`}>
                    Détails de l'atelier <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
