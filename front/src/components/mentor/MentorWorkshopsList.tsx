"use client";

import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Tag, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface MentorWorkshopsListProps {
  mentorId: string;
}

export function MentorWorkshopsList({ mentorId }: MentorWorkshopsListProps) {
  const { data: workshops, isLoading } = trpc.mentor.getPublicWorkshops.useQuery({ mentorId });

  if (isLoading) {
    return <div>Chargement des ateliers...</div>;
  }

  if (!workshops || workshops.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Ce mentor n'a pas encore d'ateliers publiés.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workshops.map((workshop: any) => (
        <Card key={workshop.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>{workshop.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{workshop.description}</p>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <Badge variant="outline">{workshop.domain}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{workshop.maxParticipants} participants max.</span>
              </div>
            </div>
            <Button asChild className="mt-4 float-right">
                <Link href={`/workshops/${workshop.id}`}>
                    Voir l'atelier <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
