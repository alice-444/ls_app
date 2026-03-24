"use client";

import type { ReactNode } from "react";
import { trpc } from "@/utils/trpc";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Loader2,
  MessageSquare,
  Clock,
  ChevronRight,
  LifeBuoy,
  Plus
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/Badge";
import { BackButton } from "@/components/shared/BackButton";
import { PageContainer } from "@/components/shared/layout";

export default function MySupportRequestsPage() {
  const { data: requests, isLoading } = trpc.support.getMyRequests.useQuery();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">En attente</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En cours</Badge>;
      case "RESOLVED":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Résolu</Badge>;
      case "CLOSED":
        return <Badge variant="secondary">Fermé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  let content: ReactNode;
  if (isLoading) {
    content = (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
      </div>
    );
  } else if (!requests || requests.length === 0) {
    content = (
      <Card className="text-center py-16 border-dashed border-2">
        <CardContent className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Aucune demande en cours</h3>
            <p className="text-ls-muted max-w-sm mx-auto mt-2">
              Vous n'avez pas encore envoyé de demande de support. Si vous rencontrez un problème, nous sommes là pour vous aider !
            </p>
          </div>
          <Button asChild variant="outline" className="mt-4 rounded-full border-brand text-brand hover:bg-brand/10">
            <Link href="/support-request">Contacter le support</Link>
          </Button>
        </CardContent>
      </Card>
    );
  } else {
    content = (
      <div className="grid gap-4">
        {requests.map((request: any) => (
          <Link key={request.id} href={`/help/support/${request.id}`}>
            <Card className="hover:border-brand transition-all group cursor-pointer overflow-hidden">
              <div className="flex items-stretch">
                <div className="w-1.5 bg-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-ls-heading truncate">
                          {request.subject}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-ls-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Créé le {format(new Date(request.createdAt), "dd MMM yyyy", { locale: fr })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Type: {request.problemType}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-ls-muted group-hover:text-brand transition-colors shrink-0" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <PageContainer className="py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <BackButton href="/help" label="Retour à l'aide" />
          <h1 className="text-3xl font-bold mt-4 flex items-center gap-2 text-ls-heading">
            <LifeBuoy className="h-8 w-8 text-brand" />
            Mes demandes de support
          </h1>
          <p className="text-ls-muted mt-1">
            Suivez l'état de vos demandes et discutez avec l'équipe LearnSup.
          </p>
        </div>
        <Button asChild className="bg-brand hover:bg-brand/90 rounded-full">
          <Link href="/support-request">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle demande
          </Link>
        </Button>
      </div>

      {content}
    </PageContainer>
  );
}
